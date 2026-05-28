"use client";

import {
  type KeyboardEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { apply_tag_autocomplete_selection } from "@/lib/apply_tag_autocomplete_selection";
import { filter_known_tags } from "@/lib/filter_known_tags";
import { format_display_tag } from "@/lib/format_display_tag";
import { get_tag_autocomplete_context } from "@/lib/get_tag_autocomplete_context";
import { get_input_class_name } from "@/lib/get_input_class_name";
import { is_complete_tag_autocomplete_query } from "@/lib/is_complete_tag_autocomplete_query";

interface TagAutocompleteInputProps {
  id: string;
  value: string;
  known_tags: string[];
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  on_change: (value: string) => void;
}

const option_class =
  "block w-full cursor-pointer rounded-[0.45rem] border-0 bg-transparent px-2.5 py-1.5 text-left font-inherit text-[0.85rem] text-inherit hover:bg-surface-hover";

/**
 * Text input that suggests existing @tags while typing.
 */
export function TagAutocompleteInput({
  id,
  value,
  known_tags,
  placeholder,
  disabled = false,
  autoFocus = false,
  on_change,
}: Readonly<TagAutocompleteInputProps>) {
  const input_ref = useRef<HTMLInputElement>(null);
  const list_ref = useRef<HTMLUListElement>(null);
  const pending_cursor_ref = useRef<number | null>(null);
  const [cursor_index, setCursor_index] = useState(0);
  const [highlighted_index, setHighlighted_index] = useState(0);

  const context = get_tag_autocomplete_context(value, cursor_index);
  const suggestions =
    context === null ? [] : filter_known_tags(known_tags, context.query);
  const is_query_complete =
    context !== null &&
    is_complete_tag_autocomplete_query(context.query, known_tags);
  const is_open =
    context !== null &&
    suggestions.length > 0 &&
    !is_query_complete &&
    !disabled;

  useLayoutEffect(() => {
    if (pending_cursor_ref.current === null || input_ref.current === null) {
      return;
    }

    input_ref.current.setSelectionRange(
      pending_cursor_ref.current,
      pending_cursor_ref.current,
    );
    setCursor_index(pending_cursor_ref.current);
    pending_cursor_ref.current = null;
  }, [value]);

  useEffect(() => {
    setHighlighted_index(0);
  }, [value, cursor_index, suggestions.length]);

  const update_cursor_from_input = (): void => {
    setCursor_index(input_ref.current?.selectionStart ?? value.length);
  };

  const close_autocomplete = (): void => {
    setHighlighted_index(0);
  };

  const apply_tag = (tag: string): void => {
    if (context === null) {
      return;
    }

    const { next_text, next_cursor } = apply_tag_autocomplete_selection(
      value,
      context,
      tag,
    );

    pending_cursor_ref.current = next_cursor;
    on_change(next_text);
    close_autocomplete();
  };

  const handle_key_down = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (!is_open) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted_index((index) => (index + 1) % suggestions.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted_index(
        (index) => (index - 1 + suggestions.length) % suggestions.length,
      );
      return;
    }

    if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      const selected = suggestions[highlighted_index];

      if (selected !== undefined) {
        apply_tag(selected);
      }

      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      close_autocomplete();
    }
  };

  return (
    <div className="relative min-w-0">
      <input
        ref={input_ref}
        id={id}
        type="text"
        role="combobox"
        className={get_input_class_name()}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={is_open}
        aria-controls={is_open ? `${id}-tag-suggestions` : undefined}
        onChange={(event) => {
          on_change(event.target.value);
          setCursor_index(
            event.target.selectionStart ?? event.target.value.length,
          );
        }}
        onClick={update_cursor_from_input}
        onKeyUp={update_cursor_from_input}
        onKeyDown={handle_key_down}
        onBlur={() => {
          window.setTimeout(close_autocomplete, 120);
        }}
      />
      {is_open ? (
        <ul
          ref={list_ref}
          id={`${id}-tag-suggestions`}
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 list-none overflow-y-auto rounded-md border border-panel-border bg-panel p-1.5 shadow-md"
        >
          {suggestions.map((tag, index) => (
            <li
              key={tag}
              role="option"
              aria-selected={index === highlighted_index}
            >
              <button
                type="button"
                className={`${option_class} ${
                  index === highlighted_index ? "bg-surface-hover" : ""
                }`}
                onMouseDown={(event) => {
                  event.preventDefault();
                  apply_tag(tag);
                }}
              >
                {format_display_tag(tag)}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
