import {
  classifyPhase,
  counterpartDomains,
  detectRegime,
  directionOf,
  isExhaustedLanguage,
  isNoise,
  looksLikeCorrespondence,
  matchPartyIds,
} from "./classify";
import { PARTY_DEFS, PHASE_META } from "./registry";
import type {
  DocketEmail,
  DocketLoad,
  Party,
  Phase,
  PhaseId,
  PhaseStatus,
  RawEmail,
} from "./types";

export const PHASE_ORDER: PhaseId[] = ["request", "review", "cpr"];

function ts(date: string): number {
  const n = Date.parse(date);
  return Number.isFinite(n) ? n : 0;
}

function byDateAsc(a: { date: string }, b: { date: string }) {
  return ts(a.date) - ts(b.date);
}

function emptyPhase(id: PhaseId): Phase {
  const meta = PHASE_META[id];
  return {
    id,
    label: meta.label,
    shortLabel: meta.shortLabel,
    status: "not_started",
    emails: [],
    note: meta.note,
  };
}

function textOf(e: RawEmail | DocketEmail) {
  return `${e.subject}\n${e.snippet}\n${e.body ?? ""}`;
}

function statusFromEmails(
  id: PhaseId,
  emails: DocketEmail[],
  ctx: { requestDone: boolean; reviewDone: boolean; cprEligible: boolean },
): PhaseStatus {
  if (emails.length === 0) {
    if (id === "review") return ctx.requestDone ? "ready" : "not_started";
    if (id === "cpr") {
      if (!ctx.cprEligible) return "not_started";
      if (ctx.requestDone && ctx.reviewDone) return "ready";
      if (ctx.requestDone) return "ready";
      return "not_started";
    }
    return "not_started";
  }

  const sorted = [...emails].sort(byDateAsc);
  const last = sorted[sorted.length - 1];
  const exhausted = emails.some(
    (e) => e.direction === "received" && isExhaustedLanguage(textOf(e)),
  );
  if (exhausted) return "exhausted";
  if (last.direction === "sent") return id === "cpr" ? "sent" : "awaiting";
  return "responded";
}

function isDone(status: PhaseStatus) {
  return status === "exhausted" || status === "responded";
}

function currentStage(phases: Record<PhaseId, Phase>): PhaseId {
  if (phases.cpr.status === "ready" || phases.cpr.emails.length > 0) return "cpr";
  if (phases.review.emails.length > 0 || phases.review.status === "ready") {
    return "review";
  }
  return "request";
}

function adHocId(domain: string) {
  return `domain:${domain}`;
}

export function buildParties(raw: RawEmail[]): Party[] {
  const buckets = new Map<
    string,
    { emails: DocketEmail[]; raw: RawEmail[] }
  >();

  const known = new Map(PARTY_DEFS.map((d) => [d.id, d]));

  for (const email of raw) {
    if (isNoise(email)) continue;
    let ids = matchPartyIds(email);
    if (ids.length === 0) {
      if (!looksLikeCorrespondence(email)) continue;
      const domains = counterpartDomains(email);
      if (domains.length === 0) continue;
      ids = [adHocId(domains[0])];
    }
    const dir = directionOf(email);
    const phase = classifyPhase(email);
    for (const id of ids) {
      const docket: DocketEmail = { ...email, direction: dir, phase, partyId: id };
      const bucket = buckets.get(id) ?? { emails: [], raw: [] };
      bucket.emails.push(docket);
      bucket.raw.push(email);
      buckets.set(id, bucket);
    }
  }

  const parties: Party[] = [];

  for (const [id, bucket] of buckets) {
    const def = known.get(id);
    const phases = {
      request: emptyPhase("request"),
      review: emptyPhase("review"),
      cpr: emptyPhase("cpr"),
    } as Record<PhaseId, Phase>;

    for (const e of bucket.emails) {
      phases[e.phase].emails.push(e);
    }
    for (const idp of PHASE_ORDER) {
      phases[idp].emails.sort(byDateAsc);
    }

    const requestProbe = statusFromEmails("request", phases.request.emails, {
      requestDone: false,
      reviewDone: false,
      cprEligible: def?.cprEligible ?? true,
    });
    const requestDone = isDone(requestProbe);
    const reviewProbe = statusFromEmails("review", phases.review.emails, {
      requestDone,
      reviewDone: false,
      cprEligible: def?.cprEligible ?? true,
    });
    const reviewDone =
      isDone(reviewProbe) ||
      (requestProbe === "exhausted" && phases.review.emails.length === 0);

    const cprEligible = def?.cprEligible ?? true;
    phases.request.status = requestProbe;
    phases.review.status = reviewProbe;
    phases.cpr.status = statusFromEmails("cpr", phases.cpr.emails, {
      requestDone,
      reviewDone,
      cprEligible,
    });

    if (!cprEligible && phases.cpr.emails.length === 0) {
      phases.cpr.status = "not_started";
      phases.cpr.note =
        "CPR 31.16 is aimed at a likely party to proceedings, not this correspondent.";
    }

    const all = bucket.emails;
    const last = [...all].sort(byDateAsc).at(-1) ?? null;
    const domainName = id.startsWith("domain:") ? id.slice(7) : id;

    parties.push({
      id,
      name: def?.name ?? domainName,
      shortName: def?.shortName ?? domainName,
      org: def?.org,
      kind: def?.kind ?? "other",
      domains: def?.domains ?? [domainName],
      aliases: def?.aliases ?? [],
      refs: def?.refs ?? [],
      regime: def?.regime ?? detectRegime(bucket.raw),
      cprEligible,
      phases,
      lastActivity: last?.date ?? null,
      emailCount: all.length,
      sentCount: all.filter((e) => e.direction === "sent").length,
      receivedCount: all.filter((e) => e.direction === "received").length,
      currentStage: currentStage(phases),
    });
  }

  parties.sort((a, b) => ts(b.lastActivity ?? "") - ts(a.lastActivity ?? ""));
  return parties;
}

export function buildDocket(
  raw: RawEmail[],
  meta: Omit<DocketLoad, "parties">,
): DocketLoad {
  return { ...meta, parties: buildParties(raw) };
}
