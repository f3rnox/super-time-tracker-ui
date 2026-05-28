"use client";

import {
  type ComponentProps,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import { AiSparklesIcon } from "@/components/ai-sparkles-icon";
import { TagAutocompleteInput } from "@/components/tag-autocomplete-input";
import { build_resume_description } from "@/lib/build_resume_description";
import { get_api_key_for_suggestion_provider } from "@/lib/get_api_key_for_suggestion_provider";
import { get_button_class_name } from "@/lib/get_button_class_name";
import { claude_api_key_preference } from "@/lib/preferences/claude_api_key_preference";
import { entry_suggestion_provider_preference } from "@/lib/preferences/entry_suggestion_provider_preference";
import { google_ai_api_key_preference } from "@/lib/preferences/google_ai_api_key_preference";
import { openai_api_key_preference } from "@/lib/preferences/openai_api_key_preference";
import { request_ai_entry_description_suggestion } from "@/lib/request_ai_entry_description_suggestion";
import { use_escape_to_cancel } from "@/lib/use_escape_to_cancel";
import { type SerializedEntry } from "@/lib/types/tracker_state";

interface ActiveEntryDescriptionInlineProps {
  entry: SerializedEntry;
  known_tags: string[];
  is_pending: boolean;
  on_save: (description: string) => void;
  on_cancel: () => void;
}

/**
 * Inline description editor for the active entry panel heading.
 */
export function ActiveEntryDescriptionInline({
  entry,
  known_tags,
  is_pending,
  on_save,
  on_cancel,
}: Readonly<ActiveEntryDescriptionInlineProps>) {
  const initial_description = useMemo(
    () => build_resume_description(entry.description, entry.tags),
    [entry.description, entry.tags],
  );
  const [description, setDescription] = useState(initial_description);
  const [is_suggestion_pending, setIs_suggestion_pending] = useState(false);
  const [suggestion_error, setSuggestion_error] = useState<string | null>(null);
  const suggestion_provider = useSyncExternalStore(
    entry_suggestion_provider_preference.subscribe,
    entry_suggestion_provider_preference.get_snapshot,
    entry_suggestion_provider_preference.get_server_snapshot,
  );
  const openai_api_key = useSyncExternalStore(
    openai_api_key_preference.subscribe,
    openai_api_key_preference.get_snapshot,
    openai_api_key_preference.get_server_snapshot,
  );
  const claude_api_key = useSyncExternalStore(
    claude_api_key_preference.subscribe,
    claude_api_key_preference.get_snapshot,
    claude_api_key_preference.get_server_snapshot,
  );
  const google_ai_api_key = useSyncExternalStore(
    google_ai_api_key_preference.subscribe,
    google_ai_api_key_preference.get_snapshot,
    google_ai_api_key_preference.get_server_snapshot,
  );
  const selected_api_key = get_api_key_for_suggestion_provider(
    suggestion_provider,
    {
      openai: openai_api_key,
      claude: claude_api_key,
      google_ai: google_ai_api_key,
    },
  );
  const can_suggest =
    suggestion_provider !== "none" && selected_api_key.trim().length > 0;

  useEffect(() => {
    setDescription(build_resume_description(entry.description, entry.tags));
  }, [entry.description, entry.id, entry.sheetName, entry.tags]);

  use_escape_to_cancel(on_cancel);

  const handle_submit: NonNullable<ComponentProps<"form">["onSubmit"]> = (
    event,
  ) => {
    event.preventDefault();
    const trimmed = description.trim();

    if (trimmed === initial_description.trim()) {
      on_cancel();
      return;
    }

    on_save(trimmed);
  };

  const handle_suggest = async (): Promise<void> => {
    if (!can_suggest) {
      return;
    }

    setIs_suggestion_pending(true);
    setSuggestion_error(null);

    try {
      const notes_context = entry.notes.map((note) => note.text).join("\n");
      const suggestion = await request_ai_entry_description_suggestion({
        provider: suggestion_provider,
        api_key: selected_api_key,
        context: description,
        notes: notes_context,
      });
      setDescription(suggestion);
    } catch (error: unknown) {
      setSuggestion_error(
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      setIs_suggestion_pending(false);
    }
  };

  return (
    <form
      className="flex min-w-0 flex-1 flex-col gap-2"
      onSubmit={handle_submit}
    >
      <div className="flex min-w-0 items-center gap-2 max-[700px]:flex-col max-[700px]:items-start">
        <div className="min-w-0 flex-1">
          <TagAutocompleteInput
            id={`active-entry-description-${entry.id}`}
            value={description}
            known_tags={known_tags}
            placeholder="e.g. crafting something @design"
            disabled={is_pending}
            autoFocus
            on_change={setDescription}
          />
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 max-[700px]:w-full">
          {can_suggest ? (
            <button
              type="button"
              className={get_button_class_name("ghost", "small")}
              disabled={is_pending || is_suggestion_pending}
              title="Revise description with AI"
              aria-label="Revise description with AI"
              onClick={() => void handle_suggest()}
            >
              <span className="inline-flex items-center gap-1.5">
                <AiSparklesIcon />
                {is_suggestion_pending ? "Revising…" : "Revise with AI"}
              </span>
            </button>
          ) : null}
          <button
            type="submit"
            className={get_button_class_name("primary", "small")}
            disabled={
              is_pending || description.trim() === initial_description.trim()
            }
          >
            Save
          </button>
          <button
            type="button"
            className={get_button_class_name("ghost", "small")}
            disabled={is_pending}
            onClick={on_cancel}
          >
            Cancel
          </button>
        </div>
      </div>
      {suggestion_error === null ? null : (
        <p className="m-0 text-[0.8rem] text-danger">{suggestion_error}</p>
      )}
    </form>
  );
}
