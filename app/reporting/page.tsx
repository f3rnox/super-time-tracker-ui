import { Suspense } from "react";

import { ReportingView } from "@/components/reporting-view";
import { get_reporting_stats } from "@/lib/get_reporting_stats";

/**
 * Per-sheet time-tracking reporting route.
 */
export default async function ReportingPage() {
  const { referenceNow, sourceSheets } = await get_reporting_stats();

  return (
    <Suspense fallback={null}>
      <ReportingView
        source_sheets={sourceSheets}
        reference_now={referenceNow}
      />
    </Suspense>
  );
}
