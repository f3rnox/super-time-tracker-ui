"use client";

import { useSyncExternalStore } from "react";

import { SettingRadioGroup } from "@/components/setting-radio-group";
import { SettingsPageLayout } from "@/components/settings-page-layout";
import { get_input_class_name } from "@/lib/get_input_class_name";
import { claude_api_key_preference } from "@/lib/preferences/claude_api_key_preference";
import { entry_suggestion_provider_preference } from "@/lib/preferences/entry_suggestion_provider_preference";
import { google_ai_api_key_preference } from "@/lib/preferences/google_ai_api_key_preference";
import { openai_api_key_preference } from "@/lib/preferences/openai_api_key_preference";
import { persist_ui_preference } from "@/lib/persist_ui_preference";
import { type EntrySuggestionProvider } from "@/lib/types/ui_preferences";

const provider_options: {
  value: EntrySuggestionProvider;
  label: string;
  description: string;
}[] = [
  {
    value: "none",
    label: "Disabled",
    description: "Do not call any AI provider.",
  },
  {
    value: "openai",
    label: "OpenAI",
    description: "Use OpenAI for suggestions.",
  },
  {
    value: "claude",
    label: "Claude",
    description: "Use Claude for suggestions.",
  },
  {
    value: "google_ai",
    label: "Google AI",
    description: "Use Gemini for suggestions.",
  },
];

const set_provider = (value: EntrySuggestionProvider): void => {
  persist_ui_preference(entry_suggestion_provider_preference, value);
};

/**
 * Settings page for LLM provider and API keys used by entry suggestions.
 */
export function EntrySuggestionsSettingsView() {
  const provider = useSyncExternalStore(
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

  const save_openai_key = (value: string): void => {
    openai_api_key_preference.write(value.trim());
    openai_api_key_preference.notify();
  };

  const save_claude_key = (value: string): void => {
    claude_api_key_preference.write(value.trim());
    claude_api_key_preference.notify();
  };

  const save_google_ai_key = (value: string): void => {
    google_ai_api_key_preference.write(value.trim());
    google_ai_api_key_preference.notify();
  };

  return (
    <SettingsPageLayout
      breadcrumb={{
        current: "AI suggestions",
        parent: { label: "Settings", href: "/settings" },
      }}
      title="AI suggestions"
      description="Choose an LLM provider and API key for entry description suggestions."
    >
      <ul
        className="m-0 flex w-full list-none flex-col gap-2 p-0"
        aria-label="AI suggestion settings"
      >
        <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
          <SettingRadioGroup<EntrySuggestionProvider>
            name="entry-suggestion-provider"
            legend="Suggestion provider"
            description="The check-in form uses this provider when Suggest is clicked."
            value={provider}
            options={provider_options}
            on_change={set_provider}
          />
        </li>
        <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
          <label className="flex flex-col gap-1.5">
            <span className="text-[0.95rem] font-semibold">OpenAI API key</span>
            <input
              type="password"
              className={get_input_class_name()}
              value={openai_api_key}
              onChange={(event) => save_openai_key(event.target.value)}
              placeholder="sk-..."
              autoComplete="off"
            />
            <span className="text-[0.8rem] leading-snug text-muted">
              Stored locally in your browser. Used only for suggestion requests.
            </span>
          </label>
        </li>
        <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
          <label className="flex flex-col gap-1.5">
            <span className="text-[0.95rem] font-semibold">Claude API key</span>
            <input
              type="password"
              className={get_input_class_name()}
              value={claude_api_key}
              onChange={(event) => save_claude_key(event.target.value)}
              placeholder="sk-ant-..."
              autoComplete="off"
            />
            <span className="text-[0.8rem] leading-snug text-muted">
              Stored locally in your browser. Used only for suggestion requests.
            </span>
          </label>
        </li>
        <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
          <label className="flex flex-col gap-1.5">
            <span className="text-[0.95rem] font-semibold">
              Google AI API key
            </span>
            <input
              type="password"
              className={get_input_class_name()}
              value={google_ai_api_key}
              onChange={(event) => save_google_ai_key(event.target.value)}
              placeholder="AIza..."
              autoComplete="off"
            />
            <span className="text-[0.8rem] leading-snug text-muted">
              Stored locally in your browser. Used only for suggestion requests.
            </span>
          </label>
        </li>
      </ul>
    </SettingsPageLayout>
  );
}
