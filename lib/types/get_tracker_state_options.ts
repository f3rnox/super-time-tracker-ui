import { type TimeTrackerDB } from "@/lib/types";

export interface GetTrackerStateOptions {
  /** In-memory database; when omitted, {@link read_db} is used (deduped per request). */
  db?: TimeTrackerDB;
  /** Writes active sheet to disk when it differs from the resolved sheet. Default true. */
  persist_active_sheet?: boolean;
  /** Serializes all entries on the active sheet. Default true. */
  include_sheet_entries?: boolean;
  /** Attaches global focus nudges metrics. Default false. */
  include_focus_nudges?: boolean;
}
