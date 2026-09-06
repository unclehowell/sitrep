import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  LoaderCircle,
  RefreshCw,
  Search,
} from "lucide-react";
import { format } from "date-fns";
import {
  classifyCallToolError,
  redirectToLoginIfRequired,
} from "@/lib/app-data";
import { loadDocket, loadMessage } from "@/lib/correspondence/gmail.functions";
import { PHASE_ORDER } from "@/lib/correspondence/docket";
import { getSnapshotDocket } from "@/lib/correspondence/snapshot-docket";
import type {
  Direction,
  DocketEmail,
  DocketLoad,
  Party,
  PhaseId,
  PhaseStatus,
} from "@/lib/correspondence/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Filter = "all" | "awaiting" | "exhausted" | "cpr";

const STATUS_LABEL: Record<PhaseStatus, string> = {
  not_started: "Not started",
  open: "Open",
  awaiting: "Awaiting",
  responded: "Replied",
  exhausted: "Exhausted",
  ready: "Ready",
  sent: "Issued",
};

function fmtDate(raw: string | null) {
  if (!raw) return "—";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return format(d, "d MMM yyyy");
}

function fmtStamp(raw: string) {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return format(d, "d MMM yyyy · HH:mm");
}

function displayName(from: string) {
  const m = from.match(/^(.*?)\s*<[^>]+>/);
  const name = (m ? m[1] : from).replace(/["<>]/g, "").trim();
  return name || from;
}

export function DocketApp() {
  const [docket, setDocket] = useState<DocketLoad>(() => getSnapshotDocket());
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [openPhase, setOpenPhase] = useState<Record<string, PhaseId | null>>({});
  const [bodies, setBodies] = useState<Record<string, string>>(() => {
    const seed: Record<string, string> = {};
    const snap = getSnapshotDocket();
    for (const p of snap.parties) {
      for (const ph of PHASE_ORDER) {
        for (const e of p.phases[ph].emails) {
          if (e.body) seed[e.id] = e.body;
        }
      }
    }
    return seed;
  });
  const [bodyLoading, setBodyLoading] = useState<Record<string, boolean>>({});
  const [loginRes, setLoginRes] = useState<DocketLoad | null>(null);

  async function fetchDocket(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await loadDocket();
      setDocket(res);
      setLoginRes(res);
      const seed: Record<string, string> = {};
      for (const p of res.parties) {
        for (const ph of PHASE_ORDER) {
          for (const e of p.phases[ph].emails) {
            if (e.body) seed[e.id] = e.body;
          }
        }
      }
      if (Object.keys(seed).length) {
        setBodies((prev) => ({ ...seed, ...prev }));
      }
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void fetchDocket();
  }, []);

  const parties = useMemo(() => {
    if (!docket) return [];
    const needle = q.trim().toLowerCase();
    return docket.parties.filter((p) => {
      if (filter === "awaiting") {
        if (!PHASE_ORDER.some((id) => p.phases[id].status === "awaiting")) {
          return false;
        }
      } else if (filter === "exhausted") {
        if (!PHASE_ORDER.some((id) => p.phases[id].status === "exhausted")) {
          return false;
        }
      } else if (filter === "cpr") {
        if (p.phases.cpr.status !== "ready" && p.phases.cpr.emails.length === 0) {
          return false;
        }
      }
      if (!needle) return true;
      const blob = [
        p.name,
        p.shortName,
        p.org ?? "",
        p.refs.join(" "),
        ...PHASE_ORDER.flatMap((id) =>
          p.phases[id].emails.map((e) => `${e.subject} ${e.from}`),
        ),
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(needle);
    });
  }, [docket, q, filter]);

  async function onExpandEmail(email: DocketEmail) {
    if (bodies[email.id] || bodyLoading[email.id]) return;
    if (email.body) {
      setBodies((b) => ({ ...b, [email.id]: email.body! }));
      return;
    }
    setBodyLoading((s) => ({ ...s, [email.id]: true }));
    try {
      const res = await loadMessage({ data: { id: email.id } });
      if (res.body) {
        setBodies((b) => ({ ...b, [email.id]: res.body }));
      } else if (email.snippet) {
        setBodies((b) => ({ ...b, [email.id]: email.snippet }));
      }
    } finally {
      setBodyLoading((s) => ({ ...s, [email.id]: false }));
    }
  }

  const errKind = docket?.errorKind;
  const previewToken =
    (docket?.errorDetail ?? "").startsWith("missing_connector_token");
  const showLogin = errKind === "login" && !previewToken && docket?.loginRequired;

  const cprReady = docket?.parties.filter(
    (p) => p.phases.cpr.status === "ready",
  ).length ?? 0;

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="border-b border-line bg-surface px-4 pb-5 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted">
                Ty Mawr · Llandough
              </p>
              <h1 className="mt-1 font-display text-3xl font-medium tracking-[-0.03em] text-fg sm:text-4xl">
                Cofnod
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                Parties reached. Each row is collapsed so the list stays readable.
                Open a party, then a step: FOI / SAR / GDPR → Internal Review →
                CPR 31.16 (last resort).
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              aria-label="Refresh from Gmail"
              disabled={refreshing}
              onClick={() => void fetchDocket(true)}
            >
              <RefreshCw
                className={cn("size-4", refreshing && "animate-spin")}
              />
            </Button>
          </div>

          {docket && (
            <dl className="grid grid-cols-3 gap-2 text-center sm:grid-cols-4">
              <Stat label="Parties" value={docket.parties.length} />
              <Stat
                label="Letters"
                value={docket.parties.reduce((n, p) => n + p.emailCount, 0)}
              />
              <Stat
                label="Awaiting"
                value={docket.parties.filter((p) =>
                  PHASE_ORDER.some((id) => p.phases[id].status === "awaiting"),
                ).length}
              />
              <Stat label="CPR ready" value={cprReady} accent />
            </dl>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-5 sm:px-8">
        {docket && (
          <SourceBanner
            docket={docket}
            previewToken={previewToken}
            showLogin={!!showLogin}
            onLogin={() => {
              if (!loginRes) return;
              redirectToLoginIfRequired({
                ok: false,
                data: null,
                loginRequired: loginRes.loginRequired,
                loginUrl: loginRes.loginUrl,
              });
            }}
          />
        )}

        <div className="mt-4 flex flex-col gap-3">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search parties, refs, subjects"
              className="h-11 w-full rounded-lg bg-surface pl-10 pr-3 text-sm text-fg shadow-[var(--shadow-border)] placeholder:text-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "All parties"],
                ["awaiting", "Awaiting"],
                ["exhausted", "Exhausted"],
                ["cpr", "CPR ready"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={cn(
                  "h-10 rounded-full px-3.5 text-sm font-medium transition-colors duration-150",
                  filter === id
                    ? "bg-paper text-paper-fg"
                    : "bg-surface text-muted shadow-[var(--shadow-border)]",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <ul className="mt-5 flex flex-col gap-2">
            {parties.map((party) => (
              <li key={party.id}>
                <PartyCard
                  party={party}
                  openPhase={openPhase[party.id] ?? null}
                  onPhase={(id) =>
                    setOpenPhase((s) => ({
                      ...s,
                      [party.id]: s[party.id] === id ? null : id,
                    }))
                  }
                  bodies={bodies}
                  bodyLoading={bodyLoading}
                  onExpandEmail={onExpandEmail}
                />
              </li>
            ))}
            {parties.length === 0 && (
              <li className="rounded-xl bg-surface px-4 py-8 text-center text-sm text-muted shadow-[var(--shadow-border)]">
                No parties match this filter.
              </li>
            )}
          </ul>
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl bg-raised px-2 py-3 shadow-[var(--shadow-border)]">
      <dt className="text-[0.65rem] font-medium uppercase tracking-[0.14em] text-subtle">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1 font-display text-2xl tabular-nums",
          accent ? "text-oxblood" : "text-fg",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function SourceBanner({
  docket,
  previewToken,
  showLogin,
  onLogin,
}: {
  docket: DocketLoad;
  previewToken: boolean;
  showLogin: boolean;
  onLogin: () => void;
}) {
  const kind = docket.errorKind;
  if (showLogin) {
    return (
      <div className="rounded-xl bg-raised px-4 py-3 text-sm shadow-[var(--shadow-border)]">
        <p className="font-medium">Continue with Grok to load live Gmail.</p>
        {docket.errorDetail && (
          <p className="mt-1 text-xs text-subtle">{docket.errorDetail}</p>
        )}
        <Button className="mt-3" onClick={onLogin}>
          Continue with Grok
        </Button>
      </div>
    );
  }
  if (kind === "not_connected") {
    return (
      <div className="rounded-xl bg-raised px-4 py-3 text-sm shadow-[var(--shadow-border)]">
        <p className="font-medium">Connect Gmail in Grok to refresh the live inbox.</p>
        {docket.errorDetail && (
          <p className="mt-1 text-xs text-subtle">{docket.errorDetail}</p>
        )}
        <p className="mt-2 text-muted">
          Showing the captured Gmail snapshot from {fmtDate(docket.fetchedAt)}.
        </p>
      </div>
    );
  }
  if (previewToken || docket.source === "snapshot") {
    return (
      <p className="text-xs text-subtle">
        Gmail snapshot · {fmtDate(docket.fetchedAt)}
        {previewToken
          ? " · live inbox temporarily unavailable — reload the preview to retry."
          : ""}
        {docket.errorDetail && kind && kind !== "login" ? (
          <span className="mt-1 block">{docket.errorDetail}</span>
        ) : null}
      </p>
    );
  }
  if (kind && kind !== "login") {
    const mapped = classifyCallToolError({
      ok: false,
      data: null,
      errorMessage: docket.errorDetail,
    });
    return (
      <div className="rounded-xl bg-raised px-4 py-3 text-sm shadow-[var(--shadow-border)]">
        <p className="font-medium">{mapped?.message ?? docket.error}</p>
        {docket.errorDetail && (
          <p className="mt-1 text-xs text-subtle">{docket.errorDetail}</p>
        )}
        <p className="mt-2 text-muted">Showing the last captured snapshot.</p>
      </div>
    );
  }
  return (
    <p className="text-xs text-subtle">
      {docket.source === "merged" ? "Live Gmail merged with snapshot" : "Live Gmail"}{" "}
      · {fmtDate(docket.fetchedAt)}
    </p>
  );
}

function PartyCard({
  party,
  openPhase,
  onPhase,
  bodies,
  bodyLoading,
  onExpandEmail,
}: {
  party: Party;
  openPhase: PhaseId | null;
  onPhase: (id: PhaseId) => void;
  bodies: Record<string, string>;
  bodyLoading: Record<string, boolean>;
  onExpandEmail: (email: DocketEmail) => void;
}) {
  const phase = openPhase ? party.phases[openPhase] : null;

  return (
    <details className="group rounded-xl bg-surface shadow-[var(--shadow-border)] open:bg-raised">
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-3 py-3 sm:px-4 [&::-webkit-details-marker]:hidden">
        <ChevronRight className="size-4 shrink-0 text-subtle transition-transform duration-200 group-open:rotate-90" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="truncate font-display text-lg font-medium tracking-[-0.02em]">
              {party.shortName}
            </h2>
            <span className="shrink-0 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-muted">
              {party.regime}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted">
            {party.org ? `${party.org} · ` : ""}
            {party.emailCount} {party.emailCount === 1 ? "letter" : "letters"}
            {" · "}
            {fmtDate(party.lastActivity)}
            {" · "}
            {party.phases[party.currentStage].shortLabel}
          </p>
        </div>
      </summary>

      <div className="border-t border-line px-3 pb-4 pt-3 sm:px-4">
        {party.refs.length > 0 && (
          <p className="mb-3 text-xs text-subtle">Refs {party.refs.join(" · ")}</p>
        )}

        <nav aria-label={`${party.shortName} stages`} className="flex flex-wrap items-center gap-1">
          {PHASE_ORDER.map((id, i) => {
            const ph = party.phases[id];
            const active = openPhase === id;
            const ready = ph.status === "ready" && id === "cpr";
            return (
              <span key={id} className="flex items-center gap-1">
                {i > 0 && (
                  <span className="px-0.5 text-subtle" aria-hidden>
                    ›
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onPhase(id)}
                  aria-expanded={active}
                  className={cn(
                    "flex min-h-11 flex-col items-start rounded-lg px-2.5 py-1.5 text-left transition-colors duration-150",
                    active
                      ? "bg-paper text-paper-fg"
                      : ready
                        ? "bg-oxblood/20 text-fg"
                        : "bg-inset text-fg hover:bg-surface",
                  )}
                >
                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.08em]">
                    {ph.shortLabel}
                  </span>
                  <span
                    className={cn(
                      "text-[0.65rem]",
                      active ? "text-paper-muted" : "text-muted",
                    )}
                  >
                    {STATUS_LABEL[ph.status]}
                    {ph.emails.length ? ` · ${ph.emails.length}` : ""}
                  </span>
                </button>
              </span>
            );
          })}
        </nav>

        {phase && (
          <div className="mt-3">
            <p className="text-xs leading-relaxed text-muted">{phase.note}</p>
            {phase.emails.length === 0 ? (
              <EmptyPhase party={party} phaseId={phase.id} />
            ) : (
              <ul className="mt-3 flex flex-col gap-1.5">
                {phase.emails.map((email) => (
                  <li key={email.id}>
                    <EmailRow
                      email={email}
                      body={bodies[email.id]}
                      loading={!!bodyLoading[email.id]}
                      onExpand={() => onExpandEmail(email)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </details>
  );
}

function EmptyPhase({ party, phaseId }: { party: Party; phaseId: PhaseId }) {
  if (phaseId === "cpr") {
    const ready = party.phases.cpr.status === "ready";
    return (
      <p className="mt-3 rounded-lg bg-inset px-3 py-3 text-sm leading-relaxed text-muted">
        {ready
          ? "No CPR 31.16 letter yet. FOI / SAR / GDPR (and any internal review) have run their course — this is the last-resort disclosure step against a likely party to proceedings."
          : party.cprEligible
            ? "CPR 31.16 stays closed until the information-rights steps fail to yield the records."
            : "Not the right respondent for a CPR 31.16 application."}
      </p>
    );
  }
  if (phaseId === "review") {
    return (
      <p className="mt-3 rounded-lg bg-inset px-3 py-3 text-sm text-muted">
        {party.phases.review.status === "ready"
          ? "No internal review on file. Ready to raise one if the original reply was a refusal or incomplete."
          : "No internal review correspondence yet."}
      </p>
    );
  }
  return (
    <p className="mt-3 rounded-lg bg-inset px-3 py-3 text-sm text-muted">
      No FOI / SAR / GDPR letters filed against this party in the inbox snapshot.
    </p>
  );
}

function EmailRow({
  email,
  body,
  loading,
  onExpand,
}: {
  email: DocketEmail;
  body?: string;
  loading: boolean;
  onExpand: () => void;
}) {
  return (
    <details
      className="rounded-lg bg-inset open:bg-bg"
      onToggle={(e) => {
        if ((e.currentTarget as HTMLDetailsElement).open) onExpand();
      }}
    >
      <summary className="flex min-h-12 cursor-pointer list-none items-start gap-2 px-3 py-2.5 [&::-webkit-details-marker]:hidden">
        <ChevronDown className="mt-1 size-3.5 shrink-0 text-subtle" />
        <DirChip dir={email.direction} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-fg">{email.subject || "(no subject)"}</p>
          <p className="mt-0.5 truncate text-[0.7rem] text-subtle">
            {fmtStamp(email.date)} · {displayName(email.from)}
          </p>
        </div>
      </summary>
      <article className="border-t border-line px-3 py-3">
        {loading && !body ? (
          <p className="flex items-center gap-2 text-xs text-muted">
            <LoaderCircle className="size-3.5 animate-spin" />
            Loading full letter…
          </p>
        ) : (
          <pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-md bg-paper px-3 py-3 font-sans text-[0.85rem] leading-relaxed text-paper-fg">
            {body || email.body || email.snippet || "No body on this message."}
          </pre>
        )}
      </article>
    </details>
  );
}

function DirChip({ dir }: { dir: Direction }) {
  return (
    <span
      className={cn(
        "mt-0.5 inline-flex h-5 shrink-0 items-center rounded-full px-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.08em]",
        dir === "sent"
          ? "bg-slate/15 text-slate"
          : "bg-await/20 text-await",
      )}
    >
      {dir === "sent" ? "Sent" : "Recv"}
    </span>
  );
}
