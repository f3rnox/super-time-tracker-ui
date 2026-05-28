import { EndOfDayReviewView } from "@/components/end-of-day-review-view";
import { get_end_of_day_review_page_data } from "@/lib/get_end_of_day_review_page_data";

/**
 * End-of-day review route for closing timers and cleaning up today's log.
 */
export default async function ReviewPage() {
  const initial_data = await get_end_of_day_review_page_data();

  return <EndOfDayReviewView initial_data={initial_data} />;
}
