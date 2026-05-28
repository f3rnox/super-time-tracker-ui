import { NextResponse } from "next/server";

import { api_error_response } from "@/lib/api_error_response";
import { get_authenticated_user_id } from "@/lib/get_authenticated_user_id";
import { import_local_db_to_supabase } from "@/lib/import_local_db_to_supabase";
import { write_supabase_ui_preferences } from "@/lib/write_supabase_ui_preferences";

interface ImportBody {
  preferences?: Record<string, string>;
}

/**
 * Imports local db.json and optional UI preferences into Supabase when empty.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const user_id = await get_authenticated_user_id();

    if (user_id === null) {
      return api_error_response(new Error("Sign in required"), 401);
    }

    const imported = await import_local_db_to_supabase(user_id);

    let body: ImportBody = {};

    try {
      body = (await request.json()) as ImportBody;
    } catch {
      body = {};
    }

    const client_preferences = body.preferences ?? {};

    if (Object.keys(client_preferences).length > 0) {
      await write_supabase_ui_preferences(user_id, client_preferences);
    }

    return NextResponse.json({ imported });
  } catch (error: unknown) {
    return api_error_response(error, 500);
  }
}
