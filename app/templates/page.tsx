import { TemplateLibraryView } from "@/components/template-library-view";
import { get_template_library_page_data } from "@/lib/get_template_library_page_data";

/**
 * First-class entry template library route.
 */
export default async function TemplatesPage() {
  const initial_data = await get_template_library_page_data();

  return <TemplateLibraryView initial_data={initial_data} />;
}
