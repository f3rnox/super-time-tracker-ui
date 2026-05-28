"use client";

import { type ReactNode } from "react";

import { get_setting_radio_options_grid_class } from "@/lib/get_setting_radio_options_grid_class";

interface SettingRadioGroupOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface SettingRadioGroupProps<T extends string> {
  name: string;
  legend: ReactNode;
  description?: ReactNode;
  value: T;
  options: SettingRadioGroupOption<T>[];
  disabled?: boolean;
  on_change: (value: T) => void;
}

/**
 * Themed radio group for single-choice settings.
 */
export function SettingRadioGroup<T extends string>({
  name,
  legend,
  description,
  value,
  options,
  disabled = false,
  on_change,
}: SettingRadioGroupProps<T>) {
  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="m-0 mb-1 text-[0.95rem] font-semibold">
        {legend}
      </legend>
      {description !== undefined ? (
        <p className="m-0 mb-2 text-[0.8rem] leading-snug text-muted">
          {description}
        </p>
      ) : null}
      <div className={get_setting_radio_options_grid_class(options.length)}>
        {options.map((option) => {
          const is_selected = option.value === value;

          return (
            <label
              key={option.value}
              className={`flex h-full cursor-pointer flex-col gap-2 rounded-md border px-2.5 py-2 transition-colors duration-150 ${
                is_selected
                  ? "border-accent-border bg-accent-soft"
                  : "border-panel-border hover:bg-surface-hover"
              }`}
            >
              <span className="flex items-start gap-2">
                <input
                  type="radio"
                  className="mt-0.5 shrink-0"
                  name={name}
                  value={option.value}
                  checked={is_selected}
                  disabled={disabled}
                  onChange={() => on_change(option.value)}
                />
                <span className="text-[0.9rem] font-semibold leading-snug">
                  {option.label}
                </span>
              </span>
              {option.description !== undefined ? (
                <span className="text-[0.8rem] leading-snug text-muted">
                  {option.description}
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
