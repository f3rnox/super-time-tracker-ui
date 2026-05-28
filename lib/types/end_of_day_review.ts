import { type SerializedEntry } from "@/lib/types/tracker_state";

export interface EndOfDayReviewEntry extends SerializedEntry {
  reviewDurationMs: number;
}

export interface EndOfDayReviewIdleGap {
  id: string;
  start: string;
  end: string;
  durationMs: number;
  previousEntry: EndOfDayReviewEntry | null;
  nextEntry: EndOfDayReviewEntry | null;
}

export type EndOfDayReviewTagIssueKind = "missing_tags" | "tag_casing";

export interface EndOfDayReviewTagIssue {
  entry: EndOfDayReviewEntry;
  kinds: EndOfDayReviewTagIssueKind[];
}

export interface EndOfDayReviewPageData {
  dateLabel: string;
  reviewStart: string;
  reviewEnd: string;
  runningEntries: SerializedEntry[];
  entries: EndOfDayReviewEntry[];
  longEntries: EndOfDayReviewEntry[];
  tagIssues: EndOfDayReviewTagIssue[];
  idleGaps: EndOfDayReviewIdleGap[];
  sheetNames: string[];
  knownTags: string[];
  longEntryThresholdMs: number;
  idleGapThresholdMs: number;
}
