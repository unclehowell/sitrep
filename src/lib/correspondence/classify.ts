import type { Direction, PartyKind, PhaseId, RawEmail } from "./types";
import {
  IGNORE_DOMAINS,
  PARTY_DEFS,
  SELF_EMAILS,
  type PartyDef,
} from "./registry";

function norm(s: string) {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function haystack(email: RawEmail) {
  return norm(
    [
      email.from,
      email.to.join(" "),
      (email.cc ?? []).join(" "),
      email.subject,
      email.snippet,
      email.body ?? "",
    ].join(" "),
  );
}

function extractAddress(raw: string): string {
  const m = raw.match(/<([^>]+)>/);
  return (m ? m[1] : raw).toLowerCase().trim();
}

function extractDomain(raw: string): string {
  const addr = extractAddress(raw);
  const at = addr.lastIndexOf("@");
  return at >= 0 ? addr.slice(at + 1) : "";
}

export function isSelf(raw: string): boolean {
  const n = norm(raw);
  return SELF_EMAILS.some((s) => n.includes(s));
}

export function isNoise(email: RawEmail): boolean {
  const from = norm(email.from);
  if (IGNORE_DOMAINS.some((d) => from.includes(d))) return true;
  if (from.includes("mail delivery subsystem")) return true;
  if (from.includes("mailer-daemon")) return true;
  const sub = norm(email.subject);
  if (sub.startsWith("delivery status notification")) return true;
  if (sub.startsWith("undeliverable:")) return true;
  return false;
}

export function directionOf(email: RawEmail): Direction {
  return isSelf(email.from) ? "sent" : "received";
}

function defMatches(def: PartyDef, text: string, domains: string[]): boolean {
  if (def.domains.some((d) => domains.some((x) => x === d || x.endsWith(`.${d}`)))) {
    if (def.aliases.length === 0) return true;
    if (def.aliases.some((a) => text.includes(a))) return true;
    const owners = PARTY_DEFS.filter((p) =>
      p.domains.some((d) => def.domains.includes(d)),
    );
    if (owners.length === 1) return true;
  }
  if (def.aliases.some((a) => text.includes(a))) return true;
  return false;
}

function uniqueDomains(email: RawEmail): string[] {
  const fields = [email.from, ...email.to, ...(email.cc ?? [])];
  return [...new Set(fields.map(extractDomain).filter(Boolean))];
}

export function counterpartDomains(email: RawEmail): string[] {
  const fields = [email.from, ...email.to, ...(email.cc ?? [])];
  const out: string[] = [];
  for (const f of fields) {
    if (isSelf(f)) continue;
    const d = extractDomain(f);
    if (!d || d === "gmail.com" || d === "googlemail.com") continue;
    if (IGNORE_DOMAINS.some((x) => d.includes(x))) continue;
    if (!out.includes(d)) out.push(d);
  }
  return out;
}

const SHARED_DOMAIN_PRIORITY: Record<string, string[]> = {
  "valeofglamorgan.gov.uk": ["franks", "carroll", "vale-mo", "vale-foi"],
  "whatdotheyknow.com": ["nactso", "tna"],
  "wales.nhs.uk": ["cavuhb", "medical-examiner"],
  "cardiff.gov.uk": ["cardiff-foi"],
};

export function matchPartyIds(email: RawEmail): string[] {
  const text = haystack(email);
  const domains = uniqueDomains(email);
  const hits: PartyDef[] = [];

  for (const def of PARTY_DEFS) {
    if (defMatches(def, text, domains)) hits.push(def);
  }

  if (hits.length <= 1) return hits.map((h) => h.id);

  const aliasHits = hits.filter((d) => d.aliases.some((a) => text.includes(a)));
  if (aliasHits.length === 1) return [aliasHits[0].id];
  if (aliasHits.length > 1) {
    const elected = aliasHits.filter((d) => d.kind === "elected");
    if (elected.length >= 1 && isSelf(email.from)) {
      return aliasHits.map((d) => d.id);
    }
    return [aliasHits[0].id];
  }

  for (const domain of domains) {
    const order = SHARED_DOMAIN_PRIORITY[domain];
    if (!order) continue;
    for (const id of order) {
      if (hits.some((h) => h.id === id)) return [id];
    }
  }

  return [hits[0].id];
}

const REVIEW_RE =
  /\binternal review\b|\breview of (the )?(sar|foi|foia|eir|eoi|handling)\b|\bir20\d{2}\b|\breview outcome\b|\bcase ref: c-\d+|\breview of eoi\b|\breview of your request\b/i;
const CPR_RE =
  /\bcpr\s*31(?:\.16)?\b|\bpre-?action disclosure\b|\bpart 31\b|\bnorwich pharmacal\b|\bdisclosure application\b/i;
const SAR_RE =
  /\bsar\b|\bsubject access\b|\bdsar\b|\bdata subject rights\b|\bgdpr\b|\bdata protection act\b|\bright of access\b/i;
const FOI_RE =
  /\bfreedom of information\b|\bfoia\b|\bfoi\b|\beir\b|\beoi\b|\batisn\b|\benvironmental information\b/i;

export function classifyPhase(email: RawEmail): PhaseId {
  const text = `${email.subject}\n${email.snippet}\n${email.body ?? ""}`;
  if (CPR_RE.test(text)) return "cpr";
  if (REVIEW_RE.test(text)) return "review";
  return "request";
}

export function looksLikeCorrespondence(email: RawEmail): boolean {
  const t = haystack(email);
  return /foi|foia|eir|eoi|atisn|sar|dsar|gdpr|subject access|internal review|great house|ty mawr|llandough|buckler|cadw|disclosure|information rights|freedom of information|data protection|marconi|williams family|bp vs buckler|bp v buckler/i.test(
    t,
  );
}

export function detectRegime(
  emails: RawEmail[],
): "foi" | "sar" | "gdpr" | "mixed" {
  let foi = false;
  let sar = false;
  let gdpr = false;
  for (const e of emails) {
    const t = `${e.subject} ${e.snippet} ${e.body ?? ""}`;
    if (SAR_RE.test(t) && /gdpr|data protection/i.test(t)) gdpr = true;
    else if (SAR_RE.test(t)) sar = true;
    if (FOI_RE.test(t)) foi = true;
  }
  const n = [foi, sar, gdpr].filter(Boolean).length;
  if (n > 1) return "mixed";
  if (gdpr) return "gdpr";
  if (sar) return "sar";
  return "foi";
}

export function isExhaustedLanguage(text: string): boolean {
  return /do not hold|does not hold|no (recorded )?information|no records|unable to locate|files have been destroyed|nothing further|not the right place|not subject to the (foi|freedom)|no further information|we have now provided all|not obliged to respond|ceased to be subject to the foia|i consider to be self-explanatory|information commissioner/i.test(
    text,
  );
}

export function partyKindOf(id: string): PartyKind {
  return PARTY_DEFS.find((p) => p.id === id)?.kind ?? "other";
}

export { extractAddress, extractDomain };
