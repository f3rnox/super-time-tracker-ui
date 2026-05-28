"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { collect_ui_preferences_from_window } from "@/lib/collect_ui_preferences_from_window";
import { create_browser_supabase_client } from "@/lib/create_browser_supabase_client";
import {
  build_auth_page_href,
  type AuthPageMode,
} from "@/lib/build_auth_page_href";
import { get_button_class_name } from "@/lib/get_button_class_name";
import { get_input_class_name } from "@/lib/get_input_class_name";
import { is_auth_form_submittable } from "@/lib/is_auth_form_submittable";
import { get_supabase_auth_submit_label } from "@/lib/get_supabase_auth_submit_label";
import { is_supabase_configured } from "@/lib/is_supabase_configured";
import { message_from_unknown_error } from "@/lib/message_from_unknown_error";

interface SupabaseAuthFormProps {
  mode: AuthPageMode;
  redirect_to?: string;
}

/**
 * Email sign-in or register form for Supabase cloud sync.
 */
export function SupabaseAuthForm({
  mode,
  redirect_to = "/",
}: Readonly<SupabaseAuthFormProps>): React.ReactElement {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password_confirm, setPassword_confirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [is_pending, setIs_pending] = useState(false);

  const is_sign_up = mode === "sign_up";
  const alternate_href = build_auth_page_href(
    is_sign_up ? "sign_in" : "sign_up",
    redirect_to,
  );

  const can_submit = is_auth_form_submittable({
    email,
    password,
    password_confirm,
    is_sign_up,
  });

  const passwords_mismatch =
    is_sign_up && password_confirm.length > 0 && password !== password_confirm;

  if (!is_supabase_configured()) {
    return (
      <p className="m-0 text-[0.85rem] text-danger">
        Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and
        NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment.
      </p>
    );
  }

  const handle_submit = async (
    event: Parameters<NonNullable<React.ComponentProps<"form">["onSubmit"]>>[0],
  ): Promise<void> => {
    event.preventDefault();

    if (!can_submit) {
      return;
    }

    setIs_pending(true);
    setError(null);
    setStatus(null);

    const supabase = create_browser_supabase_client();
    const trimmed_email = email.trim();

    try {
      if (is_sign_up) {
        const { error: sign_up_error } = await supabase.auth.signUp({
          email: trimmed_email,
          password,
          options: {
            emailRedirectTo: `${globalThis.location.origin}/auth/callback?next=${encodeURIComponent(redirect_to)}`,
          },
        });

        if (sign_up_error === null) {
          setStatus(
            "Check your email to confirm the account, then sign in here.",
          );
          return;
        }

        throw sign_up_error;
      }

      const { error: sign_in_error } = await supabase.auth.signInWithPassword({
        email: trimmed_email,
        password,
      });

      if (sign_in_error === null) {
        const import_response = await fetch("/api/sync/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            preferences: collect_ui_preferences_from_window(),
          }),
        });

        if (!import_response.ok) {
          const body = (await import_response.json()) as { error?: string };
          throw new Error(body.error ?? "Cloud import failed");
        }

        router.push(redirect_to);
        router.refresh();
        return;
      }

      throw sign_in_error;
    } catch (submit_error: unknown) {
      setError(
        message_from_unknown_error(submit_error, "Authentication failed"),
      );
    } finally {
      setIs_pending(false);
    }
  };

  return (
    <form
      className="flex w-full flex-col gap-3"
      onSubmit={(event) => void handle_submit(event)}
    >
      <label className="flex flex-col gap-1 text-[0.85rem]">
        <span className="font-semibold">Email</span>
        <input
          type="email"
          autoComplete="email"
          required
          className={get_input_class_name()}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-[0.85rem]">
        <span className="font-semibold">Password</span>
        <input
          type="password"
          autoComplete={is_sign_up ? "new-password" : "current-password"}
          required
          minLength={8}
          className={get_input_class_name()}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      {is_sign_up ? (
        <label className="flex flex-col gap-1 text-[0.85rem]">
          <span className="font-semibold">Confirm password</span>
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className={get_input_class_name()}
            value={password_confirm}
            onChange={(event) => setPassword_confirm(event.target.value)}
          />
        </label>
      ) : null}
      {passwords_mismatch ? (
        <p className="m-0 text-[0.82rem] text-danger">
          Passwords do not match.
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="submit"
          className={get_button_class_name("primary")}
          disabled={is_pending || !can_submit}
        >
          {get_supabase_auth_submit_label(is_sign_up, is_pending)}
        </button>
        <Link
          href={alternate_href}
          className={`${get_button_class_name("ghost", "small")} no-underline`}
        >
          {is_sign_up ? "Already have an account?" : "Need an account?"}
        </Link>
      </div>
      {status === null ? null : (
        <p className="m-0 text-center text-[0.82rem] text-accent">{status}</p>
      )}
      {error === null ? null : (
        <p className="m-0 text-center text-[0.82rem] text-danger">{error}</p>
      )}
    </form>
  );
}
