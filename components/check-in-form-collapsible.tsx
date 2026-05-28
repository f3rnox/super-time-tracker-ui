"use client";

import {
  type ReactNode,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

import {
  CheckInForm,
  type CheckInFormValues,
} from "@/components/check-in-form";
import { get_button_class_name } from "@/lib/get_button_class_name";
import { use_check_in_form_collapsed } from "@/lib/use_check_in_form_collapsed";

export interface CheckInFormCollapsibleHandle {
  expand_and_focus: () => void;
}

interface CheckInFormCollapsibleProps {
  known_tags: string[];
  is_pending: boolean;
  on_submit: (values: CheckInFormValues) => void;
  trailing?: ReactNode;
}

/**
 * Renders the check-in form, collapsible to a button when the preference is set.
 */
export const CheckInFormCollapsible = forwardRef<
  CheckInFormCollapsibleHandle,
  CheckInFormCollapsibleProps
>(function CheckInFormCollapsible(
  { known_tags, is_pending, on_submit, trailing },
  ref,
) {
  const should_collapse_by_default = use_check_in_form_collapsed();
  const [is_expanded, setIs_expanded] = useState(true);

  useEffect(() => {
    if (should_collapse_by_default) {
      setIs_expanded(false);
    }
  }, [should_collapse_by_default]);

  useImperativeHandle(
    ref,
    () => ({
      expand_and_focus: () => {
        setIs_expanded(true);
        globalThis.requestAnimationFrame(() => {
          const input = document.getElementById("check-in-description");

          if (input instanceof HTMLElement) {
            input.focus();
          }
        });
      },
    }),
    [],
  );

  if (should_collapse_by_default && !is_expanded) {
    return (
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <button
          type="button"
          className={get_button_class_name("primary")}
          disabled={is_pending}
          onClick={() => setIs_expanded(true)}
        >
          Check in
        </button>
        {trailing}
      </div>
    );
  }

  return (
    <CheckInForm
      known_tags={known_tags}
      is_pending={is_pending}
      on_submit={(values) => {
        on_submit(values);

        if (should_collapse_by_default) {
          setIs_expanded(false);
        }
      }}
    />
  );
});
