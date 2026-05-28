/**
 * Builds the list class list for an entry notes list.
 */
export function get_entry_notes_list_class(
  is_inline: boolean,
  is_panel_in_bar: boolean,
  is_list_visible: boolean,
): string {
  const visibility = is_list_visible ? "mt-1.5" : "hidden";

  if (is_inline) {
    return `m-0 flex list-none flex-col gap-1.5 overflow-visible p-0 compact:gap-0.5 ${visibility}`;
  }

  if (is_panel_in_bar) {
    return `m-0 grid min-h-0 flex-1 list-none auto-rows-fr grid-cols-2 gap-2 p-0 max-[860px]:grid-cols-1 ${visibility}`;
  }

  return `m-0 grid list-none grid-cols-2 gap-2 p-0 max-[860px]:grid-cols-1 ${visibility}`;
}
