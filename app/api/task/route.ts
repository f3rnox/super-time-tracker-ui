import { NextResponse } from "next/server";

import { api_error_response } from "@/lib/api_error_response";
import { create_task } from "@/lib/create_task";
import { delete_task } from "@/lib/delete_task";
import { get_tasks_page_data } from "@/lib/get_tasks_page_data";
import { update_task } from "@/lib/update_task";

interface CreateTaskBody {
  sheetName?: string;
  title?: string;
}

interface UpdateTaskBody {
  sheetName?: string;
  taskId?: string;
  title?: string;
  completed?: boolean;
  targetSheetName?: string;
}

interface DeleteTaskBody {
  sheetName?: string;
  taskId?: string;
}

/**
 * Creates a sheet task.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as CreateTaskBody;
    const sheet_name = body.sheetName?.trim() ?? "";

    if (sheet_name.length === 0) {
      return api_error_response(new Error("Sheet name is required"));
    }

    await create_task({
      sheet_name,
      title: body.title ?? "",
    });

    return NextResponse.json(await get_tasks_page_data());
  } catch (error: unknown) {
    return api_error_response(error);
  }
}

/**
 * Updates a sheet task.
 */
export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as UpdateTaskBody;
    const sheet_name = body.sheetName?.trim() ?? "";
    const task_id = body.taskId?.trim() ?? "";

    if (sheet_name.length === 0) {
      return api_error_response(new Error("Sheet name is required"));
    }

    if (task_id.length === 0) {
      return api_error_response(new Error("Task id is required"));
    }

    await update_task({
      sheet_name,
      task_id,
      title: body.title,
      completed: body.completed,
      target_sheet_name: body.targetSheetName?.trim(),
    });

    return NextResponse.json(await get_tasks_page_data());
  } catch (error: unknown) {
    return api_error_response(error);
  }
}

/**
 * Deletes a sheet task.
 */
export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as DeleteTaskBody;
    const sheet_name = body.sheetName?.trim() ?? "";
    const task_id = body.taskId?.trim() ?? "";

    if (sheet_name.length === 0) {
      return api_error_response(new Error("Sheet name is required"));
    }

    if (task_id.length === 0) {
      return api_error_response(new Error("Task id is required"));
    }

    await delete_task({ sheet_name, task_id });

    return NextResponse.json(await get_tasks_page_data());
  } catch (error: unknown) {
    return api_error_response(error);
  }
}
