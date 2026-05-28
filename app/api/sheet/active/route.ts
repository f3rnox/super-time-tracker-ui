import { NextResponse } from "next/server";

import { api_error_response } from "@/lib/api_error_response";
import { get_authenticated_user_id } from "@/lib/get_authenticated_user_id";
import { update_supabase_active_sheet } from "@/lib/update_supabase_active_sheet";

interface ActiveSheetBody {
  name?: string;
}

/**
 * Updates only the active sheet name in Supabase (lightweight sheet switch).
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const user_id = await get_authenticated_user_id();

    if (user_id === null) {
      return api_error_response(new Error("Sign in required"), 401);
    }

    const body = (await request.json()) as ActiveSheetBody;
    const name = body.name?.trim() ?? "";

    if (name.length === 0) {
      return api_error_response(new Error("Sheet name is required"));
    }

    await update_supabase_active_sheet(user_id, name);

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    return api_error_response(error);
  }
}
