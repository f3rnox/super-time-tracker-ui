import { build_resume_description } from "@/lib/build_resume_description";
import { navigate_to_tracker_sheet } from "@/lib/navigate_to_tracker_sheet";
import { notify_in_app } from "@/lib/notify_in_app";
import { notify_tracker_state_sync } from "@/lib/notify_tracker_state_sync";
import { post_tracker_action } from "@/lib/post_tracker_action";
import { record_entry_template_usage } from "@/lib/record_entry_template_usage";
import { type CommandPaletteItem } from "@/lib/types/command_palette";

export interface ExecuteCommandPaletteItemArgs {
  item: CommandPaletteItem;
  pathname: string;
  navigate: (href: string) => void;
}

/**
 * Runs a command palette item (navigation, sheet switch, check-in, or resume).
 */
export async function execute_command_palette_item({
  item,
  pathname,
  navigate,
}: ExecuteCommandPaletteItemArgs): Promise<void> {
  switch (item.kind) {
    case "navigate":
    case "reporting_range": {
      if (item.href === undefined) {
        return;
      }

      navigate(item.href);
      return;
    }
    case "sheet": {
      if (item.sheetName === undefined) {
        return;
      }

      await switch_active_sheet(item.sheetName, pathname, navigate);
      return;
    }
    case "template_check_in": {
      const description = item.description?.trim() ?? "";

      if (description.length === 0) {
        return;
      }

      await check_in_from_palette({
        description,
        sheet_name: item.sheetName,
        pathname,
        navigate,
      });

      if (item.templateId !== undefined) {
        record_entry_template_usage(item.templateId);
      }
      return;
    }
    case "resume_last":
    case "resume_entry": {
      const description = item.description ?? "";
      const tags = item.tags ?? [];

      await check_in_from_palette({
        description: build_resume_description(description, tags),
        sheet_name: item.sheetName,
        pathname,
        navigate,
      });
      return;
    }
    default:
      return;
  }
}

async function switch_active_sheet(
  sheet_name: string,
  pathname: string,
  navigate: (href: string) => void,
): Promise<void> {
  navigate_to_tracker_sheet(sheet_name);
  await post_tracker_action("/api/sheet", { name: sheet_name });
  notify_tracker_state_sync();

  if (pathname !== "/") {
    navigate("/");
  }
}

async function check_in_from_palette({
  description,
  sheet_name,
  pathname,
  navigate,
}: {
  description: string;
  sheet_name?: string;
  pathname: string;
  navigate: (href: string) => void;
}): Promise<void> {
  const trimmed_sheet = sheet_name?.trim() ?? "";

  if (trimmed_sheet.length > 0) {
    navigate_to_tracker_sheet(trimmed_sheet);
    await post_tracker_action("/api/sheet", { name: trimmed_sheet });
  }

  try {
    await post_tracker_action("/api/in", {
      description,
      ...(trimmed_sheet.length > 0 ? { sheetName: trimmed_sheet } : {}),
    });
    notify_tracker_state_sync();

    if (pathname !== "/") {
      navigate("/");
    }

    notify_in_app({
      title: "Checked in",
      body: description,
    });
  } catch (error: unknown) {
    notify_in_app({
      title: "Check-in failed",
      body: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
