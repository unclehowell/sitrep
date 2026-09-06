export type RegimeKind = "foi" | "sar" | "gdpr" | "mixed";
export type PhaseId = "request" | "review" | "cpr";
export type Direction = "sent" | "received";

export type PhaseStatus =
  | "not_started"
  | "open"
  | "awaiting"
  | "responded"
  | "exhausted"
  | "ready"
  | "sent";

export type PartyKind =
  | "public_authority"
  | "archive"
  | "regulator"
  | "elected"
  | "court"
  | "other";

export type RawEmail = {
  id: string;
  threadId: string;
  from: string;
  to: string[];
  cc?: string[];
  date: string;
  subject: string;
  snippet: string;
  body?: string;
};

export type DocketEmail = RawEmail & {
  direction: Direction;
  phase: PhaseId;
  partyId: string;
};

export type Phase = {
  id: PhaseId;
  label: string;
  shortLabel: string;
  status: PhaseStatus;
  emails: DocketEmail[];
  note: string;
};

export type Party = {
  id: string;
  name: string;
  shortName: string;
  org?: string;
  kind: PartyKind;
  domains: string[];
  aliases: string[];
  refs: string[];
  regime: RegimeKind;
  cprEligible: boolean;
  phases: Record<PhaseId, Phase>;
  lastActivity: string | null;
  emailCount: number;
  sentCount: number;
  receivedCount: number;
  currentStage: PhaseId;
};

export type DocketLoad = {
  parties: Party[];
  source: "live" | "snapshot" | "merged";
  fetchedAt: string;
  loginRequired?: boolean;
  loginUrl?: string;
  error?: string;
  errorKind?: string;
  errorDetail?: string;
};
