"use client";

import {
  type ComponentProps,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import { SaveIcon } from "@/components/save-icon";
import { TagAutocompleteInput } from "@/components/tag-autocomplete-input";
import { TrashIcon } from "@/components/trash-icon";
import { get_api_key_for_suggestion_provider } from "@/lib/get_api_key_for_suggestion_provider";
import { get_button_class_name } from "@/lib/get_button_class_name";
import { get_input_class_name } from "@/lib/get_input_class_name";
import { get_select_class_name } from "@/lib/get_select_class_name";
import { claude_api_key_preference } from "@/lib/preferences/claude_api_key_preference";
import { entry_suggestion_provider_preference } from "@/lib/preferences/entry_suggestion_provider_preference";
import { google_ai_api_key_preference } from "@/lib/preferences/google_ai_api_key_preference";
import { openai_api_key_preference } from "@/lib/preferences/openai_api_key_preference";
import { request_ai_entry_description_suggestion } from "@/lib/request_ai_entry_description_suggestion";
import { use_entry_templates } from "@/lib/use_entry_templates";
import { write_entry_templates } from "@/lib/write_entry_templates";

export interface CheckInFormValues {
  description: string;
  at?: string;
}

interface CheckInFormProps {
  known_tags: string[];
  on_submit: (values: CheckInFormValues) => void;
  is_pending: boolean;
}

const template_icon_button_class =
  "inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[0.65rem] border border-panel-border bg-transparent text-muted transition-[background-color,color] duration-150 hover:bg-surface-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-input-focus-border focus-visible:outline-offset-1 disabled:cursor-not-allowed disabled:opacity-55 sm:aspect-square sm:h-full sm:w-auto sm:min-w-10 sm:max-w-11";

/**
 * Form for starting a new time sheet entry.
 */
export function CheckInForm({
  known_tags,
  on_submit,
  is_pending,
}: Readonly<CheckInFormProps>) {
  const templates = use_entry_templates();
  const [selected_template_id, setSelected_template_id] = useState("");
  const [description, setDescription] = useState("");
  const [at, setAt] = useState("");
  const [suggestion_error, setSuggestion_error] = useState<string | null>(null);
  const [is_suggestion_pending, setIs_suggestion_pending] = useState(false);
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

  const selected_template = useMemo(
    () =>
      templates.find((template) => template.id === selected_template_id) ??
      null,
    [templates, selected_template_id],
  );

  const handle_submit: NonNullable<ComponentProps<"form">["onSubmit"]> = (
    event,
  ) => {
    event.preventDefault();
    const trimmed_description = description.trim();

    if (trimmed_description.length === 0) {
      return;
    }

    const trimmed_at = at.trim();

    on_submit({
      description: trimmed_description,
      ...(trimmed_at.length > 0 ? { at: trimmed_at } : {}),
    });
    setDescription("");
    setAt("");
  };

  const save_template = (): void => {
    const template_description = description.trim();

    if (template_description.length === 0) {
      return;
    }

    const default_name = template_description.slice(0, 40);
    const name_input = globalThis.prompt(
      "Template name",
      default_name.length > 0 ? default_name : "New template",
    );

    if (name_input === null) {
      return;
    }

    const template_name = name_input.trim();

    if (template_name.length === 0) {
      return;
    }

    const template_id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const next_templates = [
      ...templates,
      {
        id: template_id,
        name: template_name,
        description: template_description,
      },
    ];

    setSelected_template_id(template_id);
    write_entry_templates(next_templates);
  };

  const delete_selected_template = (): void => {
    if (selected_template === null) {
      return;
    }

    const next_templates = templates.filter(
      (template) => template.id !== selected_template.id,
    );
    setSelected_template_id("");
    write_entry_templates(next_templates);
  };

  const suggest_description = async (): Promise<void> => {
    if (!can_suggest) {
      return;
    }

    setIs_suggestion_pending(true);
    setSuggestion_error(null);

    try {
      const next_description = await request_ai_entry_description_suggestion({
        provider: suggestion_provider,
        api_key: selected_api_key,
        context: description,
        notes: "",
      });

      setDescription(next_description);
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
      className="flex flex-col gap-2 border border-panel-border bg-panel p-[1.1rem] shadow-sm"
      onSubmit={handle_submit}
    >
      <label
        className="text-[0.85rem] text-muted"
        htmlFor="check-in-description"
      >
        What are you working on?
      </label>
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-stretch">
        <select
          className={get_select_class_name()}
          value={selected_template_id}
          disabled={is_pending || templates.length === 0}
          onChange={(event) => {
            const next_template_id = event.target.value;
            setSelected_template_id(next_template_id);

            const next_template =
              templates.find((template) => template.id === next_template_id) ??
              null;
            if (next_template !== null) {
              setDescription(next_template.description);
            }
          }}
        >
          <option value="">
            {templates.length === 0 ? "No templates" : "Use a template…"}
          </option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
        <div className="flex w-fit gap-2 justify-self-start sm:h-full">
          <button
            type="button"
            className={template_icon_button_class}
            disabled={is_pending || description.trim().length === 0}
            aria-label="Save template"
            title="Save template"
            onClick={save_template}
          >
            <SaveIcon />
          </button>
          <button
            type="button"
            className={template_icon_button_class}
            disabled={is_pending || selected_template === null}
            aria-label="Delete template"
            title="Delete template"
            onClick={delete_selected_template}
          >
            <TrashIcon />
          </button>
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start">
        <div className="min-w-0 sm:flex-1">
          <TagAutocompleteInput
            id="check-in-description"
            value={description}
            known_tags={known_tags}
            placeholder="e.g. crafting something @design"
            disabled={is_pending}
            autoFocus
            on_change={setDescription}
          />
        </div>
        <div className="sm:w-44 sm:shrink-0">
          <input
            id="check-in-at"
            className={get_input_class_name()}
            value={at}
            onChange={(event) => setAt(event.target.value)}
            placeholder="Start (optional)"
            aria-label="Start time (optional, natural language)"
            disabled={is_pending}
          />
        </div>
      </div>
      <div
        className={`grid gap-2 max-[860px]:grid-cols-1 ${
          can_suggest
            ? "grid-cols-[minmax(0,1fr)_auto]"
            : "grid-cols-[minmax(0,1fr)]"
        }`}
      >
        {can_suggest ? (
          <button
            type="button"
            className={get_button_class_name("ghost")}
            disabled={is_pending || is_suggestion_pending}
            onClick={() => void suggest_description()}
            title="Suggest description with AI"
          >
            {is_suggestion_pending ? "Suggesting…" : "Suggest"}
          </button>
        ) : null}
        <button
          type="submit"
          className={`${get_button_class_name("primary")} ${can_suggest ? "" : "col-span-full"}`}
          disabled={is_pending || description.trim().length === 0}
        >
          Check in
        </button>
      </div>
      {suggestion_error === null ? null : (
        <p className="m-0 text-[0.8rem] text-danger">{suggestion_error}</p>
      )}
    </form>
  );
}
