import { randomUUID } from "node:crypto";

import { get_sheet } from "@/lib/get_sheet";
import { read_db } from "@/lib/read_db";
import { write_db } from "@/lib/write_db";

export interface CreateTaskArgs {
  sheet_name: string;
  title: string;
}

/**
 * Adds a task to a sheet.
 */
export async function create_task(args: CreateTaskArgs): Promise<void> {
  const title = args.title.trim();

  if (title.length === 0) {
    throw new Error("Task title is required");
  }

  const db = await read_db();
  const sheet = get_sheet(db, args.sheet_name);
  const now = new Date();

  sheet.tasks.unshift({
    id: randomUUID(),
    title,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  });

  await write_db(db);
}
