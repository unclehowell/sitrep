import type { RawEmail } from "./types";

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

const str = (v: unknown) =>
  typeof v === "string" ? v : v == null ? "" : String(v);

function strList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(str).filter(Boolean);
  if (typeof v === "string" && v.trim()) return [v];
  return [];
}

function unwrap(data: unknown): unknown {
  const root = asRecord(data);
  if (!root) return data;
  const content = root.content;
  if (Array.isArray(content)) {
    const texts = content
      .map((c) => asRecord(c))
      .filter((c): c is Record<string, unknown> => !!c)
      .filter((c) => c.type === "text" || typeof c.text === "string")
      .map((c) => str(c.text));
    for (const t of texts) {
      try {
        return JSON.parse(t);
      } catch {
        /* keep looking */
      }
    }
  }
  if (root.data && typeof root.data === "object") return unwrap(root.data);
  return data;
}

function toEmail(raw: unknown, threadId: string): RawEmail | null {
  const m = asRecord(raw);
  if (!m) return null;
  const id = str(m.message_id ?? m.messageId ?? m.id);
  if (!id) return null;
  return {
    id,
    threadId: str(m.thread_id ?? m.threadId ?? threadId) || threadId || id,
    from: str(m.from ?? m.sender),
    to: strList(m.to),
    cc: strList(m.cc),
    date: str(m.date ?? m.internal_date ?? m.internalDate),
    subject: str(m.subject ?? m.title),
    snippet: str(m.body_preview ?? m.snippet ?? m.preview),
    body: str(m.body_text ?? m.bodyText ?? m.body) || undefined,
  };
}

export function extractEmails(data: unknown): RawEmail[] {
  const root = unwrap(data);
  const rec = asRecord(root);
  const out: RawEmail[] = [];
  const seen = new Set<string>();

  const push = (e: RawEmail | null) => {
    if (!e || seen.has(e.id)) return;
    seen.add(e.id);
    out.push(e);
  };

  const threads =
    (rec && Array.isArray(rec.threads) && rec.threads) ||
    (rec && Array.isArray(rec.messages) && rec.messages) ||
    (Array.isArray(root) ? root : []);

  for (const t of threads) {
    const tr = asRecord(t);
    if (!tr) {
      push(toEmail(t, ""));
      continue;
    }
    const tid = str(tr.thread_id ?? tr.threadId ?? tr.id);
    const messages = Array.isArray(tr.messages) ? tr.messages : [t];
    for (const m of messages) push(toEmail(m, tid));
  }

  if (out.length === 0) {
    push(toEmail(root, ""));
  }
  return out;
}

export function extractMessageBody(data: unknown): {
  id: string;
  body: string;
  subject: string;
} | null {
  const rec = asRecord(unwrap(data)) ?? asRecord(data);
  if (!rec) return null;
  const id = str(rec.message_id ?? rec.messageId ?? rec.id);
  const body = str(rec.body_text ?? rec.bodyText ?? rec.body ?? rec.snippet);
  if (!id || !body) return null;
  return { id, body, subject: str(rec.subject) };
}

export const GMAIL_SEARCH = "gmail_search";
export const GMAIL_GET_MESSAGE = "gmail_get_message";

export const DOCKET_QUERIES: { query: string; max_results: number }[] = [
  {
    query:
      '(FOI OR FOIA OR "freedom of information" OR ATISN OR EIR OR EOI) (Buckler OR "Great House" OR "Ty Mawr" OR Llandough OR Cadw)',
    max_results: 50,
  },
  {
    query:
      '(SAR OR DSAR OR GDPR OR "subject access" OR "data protection") (Buckler OR Williams OR Llandough)',
    max_results: 50,
  },
  {
    query: '"internal review" (FOI OR SAR OR ATISN OR EIR OR EOI OR request)',
    max_results: 50,
  },
  {
    query:
      '("CPR 31.16" OR "pre-action disclosure" OR "Norwich Pharmacal" OR "Part 31")',
    max_results: 20,
  },
];
