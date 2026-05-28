"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { create_browser_supabase_client } from "@/lib/create_browser_supabase_client";
import { merge_ui_preferences_from_cloud_on_load } from "@/lib/merge_ui_preferences_from_cloud_on_load";
import {
  clear_tracker_db_merged_this_browser_session,
  has_tracker_db_merged_this_browser_session,
} from "@/lib/has_tracker_db_merged_this_browser_session";
import { is_cloud_sync_enabled } from "@/lib/is_cloud_sync_enabled";
import { is_supabase_configured } from "@/lib/is_supabase_configured";
import { run_tracker_db_cloud_sync } from "@/lib/run_tracker_db_cloud_sync";
import { should_merge_tracker_db_on_navigation } from "@/lib/should_merge_tracker_db_on_navigation";

/**
 * Pulls cloud UI preferences after sign-in and refreshes server state.
 */
export function CloudSyncProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const last_greedy_merged_pathname_ref = useRef<string | null>(null);
  const skip_next_greedy_pathname_sync_ref = useRef(true);
  const initial_session_user_id_ref = useRef<string | null | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!is_supabase_configured() || !is_cloud_sync_enabled()) {
      return;
    }

    const supabase = create_browser_supabase_client();

    const run_merge_on_load = (refresh_after: boolean): void => {
      run_tracker_db_cloud_sync({
        merge_on_load: true,
        on_complete: refresh_after
          ? () => {
              router.refresh();
            }
          : undefined,
      }).catch(() => {
        // Toast shows the error.
      });
    };

    const start_session_sync = (refresh_after: boolean): void => {
      if (
        !should_merge_tracker_db_on_navigation() &&
        has_tracker_db_merged_this_browser_session()
      ) {
        merge_ui_preferences_from_cloud_on_load().catch(() => {
          // Ignore; tracker sync toast covers load failures.
        });
        return;
      }

      run_merge_on_load(refresh_after);
    };

    const handle_new_sign_in = (): void => {
      clear_tracker_db_merged_this_browser_session();
      last_greedy_merged_pathname_ref.current = null;
      skip_next_greedy_pathname_sync_ref.current = true;
      start_session_sync(true);
    };

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        initial_session_user_id_ref.current = session?.user.id ?? null;

        if (session !== null) {
          start_session_sync(false);
        }
      })
      .catch(() => {
        initial_session_user_id_ref.current = null;
        // Ignore; auth client unavailable offline.
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        const user_id = session?.user.id ?? null;

        if (initial_session_user_id_ref.current === undefined) {
          return;
        }

        if (user_id === initial_session_user_id_ref.current) {
          return;
        }

        initial_session_user_id_ref.current = user_id;
        handle_new_sign_in();
        return;
      }

      if (event === "SIGNED_OUT") {
        initial_session_user_id_ref.current = null;
        clear_tracker_db_merged_this_browser_session();
        last_greedy_merged_pathname_ref.current = null;
        skip_next_greedy_pathname_sync_ref.current = true;
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (
      !is_supabase_configured() ||
      !is_cloud_sync_enabled() ||
      !should_merge_tracker_db_on_navigation()
    ) {
      return;
    }

    if (skip_next_greedy_pathname_sync_ref.current) {
      skip_next_greedy_pathname_sync_ref.current = false;
      last_greedy_merged_pathname_ref.current = pathname;
      return;
    }

    if (last_greedy_merged_pathname_ref.current === pathname) {
      return;
    }

    last_greedy_merged_pathname_ref.current = pathname;

    void run_tracker_db_cloud_sync({ merge_on_load: true }).catch(() => {
      // Toast shows the error.
    });
  }, [pathname]);

  return <>{children}</>;
}
