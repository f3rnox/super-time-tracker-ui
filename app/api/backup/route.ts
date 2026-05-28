import { NextResponse } from "next/server";

import { api_error_response } from "@/lib/api_error_response";
import { DB_FILE_NAME } from "@/lib/config";
import { read_db_backup_contents } from "@/lib/read_db_backup_contents";
import { restore_db_from_uploaded_json } from "@/lib/restore_db_from_uploaded_json";

/**
 * Downloads the tracker database as JSON.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const contents = await read_db_backup_contents();

    return new NextResponse(contents, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${DB_FILE_NAME}"`,
      },
    });
  } catch (error: unknown) {
    return api_error_response(error, 500);
  }
}

/**
 * Restores the tracker database from an uploaded backup.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const uploaded: unknown = await request.json();

    await restore_db_from_uploaded_json(uploaded);

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    return api_error_response(error, 400);
  }
}
