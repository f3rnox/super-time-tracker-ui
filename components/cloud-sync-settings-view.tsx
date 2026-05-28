import { CloudAccountSetting } from "@/components/cloud-account-setting";
import { CloudSyncActions } from "@/components/cloud-sync-actions";
import { GreedyCloudSyncSetting } from "@/components/greedy-cloud-sync-setting";
import { SettingsPageLayout } from "@/components/settings-page-layout";

/**
 * Settings page: Supabase cloud sync account and sync behavior.
 */
export function CloudSyncSettingsView() {
  return (
    <SettingsPageLayout
      breadcrumb={{
        current: "Cloud sync",
        parent: { label: "Settings", href: "/settings" },
      }}
      title="Cloud sync"
      description="Sign in, automatic sync, and manual push or pull with Supabase."
    >
      <ul
        className="m-0 flex w-full list-none flex-col gap-2 p-0"
        aria-label="Cloud sync settings"
      >
        <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
          <CloudAccountSetting />
        </li>
        <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
          <GreedyCloudSyncSetting />
        </li>
        <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
          <CloudSyncActions />
        </li>
      </ul>
    </SettingsPageLayout>
  );
}
