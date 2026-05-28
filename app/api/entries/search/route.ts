import { NextResponse } from "next/server";

import { api_error_response } from "@/lib/api_error_response";
import { collect_known_tags } from "@/lib/collect_known_tags";
import { parse_entry_search_filters } from "@/lib/parse_entry_search_filters";
import { read_db } from "@/lib/read_db";
import { search_global_entries } from "@/lib/search_global_entries";

/**
 * Searches entries across descriptions, tags, and notes with optional filters.
 */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const search_params = new URL(request.url).searchParams;
    const filters = parse_entry_search_filters(search_params);
    const limit_raw = search_params.get("limit");
    const offset_raw = search_params.get("offset");
    const limit =
      limit_raw === null ? undefined : Number.parseInt(limit_raw, 10);
    const offset =
      offset_raw === null ? undefined : Number.parseInt(offset_raw, 10);

    const db = await read_db();
    const { entries, totalCount } = search_global_entries(db, filters, {
      limit: Number.isFinite(limit) ? limit : undefined,
      offset: Number.isFinite(offset) ? offset : undefined,
    });

    return NextResponse.json({
      entries,
      totalCount,
      sheetNames: db.sheets
        .map((sheet) => sheet.name)
        .sort((left, right) => left.localeCompare(right)),
      tagNames: collect_known_tags(db),
    });
  } catch (error: unknown) {
    return api_error_response(error);
  }
}
