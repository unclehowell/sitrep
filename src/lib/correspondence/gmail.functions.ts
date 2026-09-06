import { createServerFn } from "@tanstack/react-start";
import { classifyCallToolError } from "@/lib/app-data";
import { buildDocket } from "./docket";
import {
  DOCKET_QUERIES,
  extractEmails,
  extractMessageBody,
  GMAIL_GET_MESSAGE,
  GMAIL_SEARCH,
} from "./parse-gmail";
import { SNAPSHOT } from "./snapshot-docket";
import type { DocketLoad, RawEmail } from "./types";

function mergeEmails(live: RawEmail[], base: RawEmail[]): RawEmail[] {
  const map = new Map<string, RawEmail>();
  for (const e of base) map.set(e.id, e);
  for (const e of live) {
    const prev = map.get(e.id);
    map.set(e.id, {
      ...prev,
      ...e,
      body: e.body || prev?.body,
      snippet: e.snippet || prev?.snippet || "",
    });
  }
  return [...map.values()];
}

function snapshotLoad(extra: Partial<DocketLoad> = {}): DocketLoad {
  return {
    ...buildDocket(SNAPSHOT.emails, {
      source: "snapshot",
      fetchedAt: SNAPSHOT.fetchedAt,
    }),
    ...extra,
  };
}

async function timed<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => {
        timer = setTimeout(() => resolve(fallback), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export const loadDocket = createServerFn({ method: "POST" }).handler(
  async (): Promise<DocketLoad> => {
    const { callTool, ConnectorType } = await import(
      "@/lib/app-data/client.server"
    );

    const failed = {
      ok: false as const,
      data: null,
      errorMessage: "gmail_timeout",
    };

    const results = await Promise.all(
      DOCKET_QUERIES.map((q) =>
        timed(
          callTool(
            GMAIL_SEARCH,
            { query: q.query, max_results: q.max_results },
            { connectorType: ConnectorType.Gmail },
          ),
          4000,
          failed,
        ),
      ),
    );

    const live: RawEmail[] = [];
    const lastFail = results.find((r) => !r.ok) ?? null;
    let anyOk = false;
    for (const r of results) {
      if (!r.ok) continue;
      anyOk = true;
      live.push(...extractEmails(r.data));
    }

    if (anyOk) {
      return buildDocket(mergeEmails(live, SNAPSHOT.emails), {
        source: live.length ? "merged" : "snapshot",
        fetchedAt: new Date().toISOString(),
      });
    }

    const err = lastFail ? classifyCallToolError(lastFail) : null;
    return snapshotLoad({
      loginRequired: lastFail && "loginRequired" in lastFail ? lastFail.loginRequired : undefined,
      loginUrl: lastFail && "loginUrl" in lastFail ? lastFail.loginUrl : undefined,
      error: err?.message,
      errorKind: err?.kind,
      errorDetail: err?.detail ?? (lastFail && "errorMessage" in lastFail ? lastFail.errorMessage : undefined),
    });
  },
);

export const loadMessage = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { callTool, ConnectorType } = await import(
      "@/lib/app-data/client.server"
    );
    const snap = SNAPSHOT.emails.find((e) => e.id === data.id);
    const res = await timed(
      callTool(
        GMAIL_GET_MESSAGE,
        { message_id: data.id },
        { connectorType: ConnectorType.Gmail },
      ),
      4000,
      { ok: false as const, data: null, errorMessage: "gmail_timeout" },
    );
    if (res.ok) {
      const parsed = extractMessageBody(res.data);
      return {
        ok: true as const,
        body: parsed?.body || snap?.body || snap?.snippet || "",
        subject: parsed?.subject || snap?.subject || "",
        loginRequired: false as const,
      };
    }
    return {
      ok: false as const,
      body: snap?.body ?? snap?.snippet ?? "",
      subject: snap?.subject ?? "",
      errorMessage: "errorMessage" in res ? (res.errorMessage ?? "") : "",
      loginRequired: "loginRequired" in res && res.loginRequired === true,
      loginUrl: "loginUrl" in res && typeof res.loginUrl === "string" ? res.loginUrl : "",
    };
  });
