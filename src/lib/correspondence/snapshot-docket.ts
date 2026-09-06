import snapshot from "./snapshot.json";
import { buildDocket } from "./docket";
import type { DocketLoad, RawEmail } from "./types";

type Snap = { fetchedAt: string; emails: RawEmail[] };

export const SNAPSHOT = snapshot as Snap;

export function getSnapshotDocket(): DocketLoad {
  return buildDocket(SNAPSHOT.emails, {
    source: "snapshot",
    fetchedAt: SNAPSHOT.fetchedAt,
  });
}
