"use client";

import { useEffect, useRef, useState } from "react";

import { HamburgerIcon } from "@/components/hamburger-icon";

interface SheetActionsMenuProps {
  sheet_name: string;
  is_pending: boolean;
  can_delete: boolean;
  is_archived?: boolean;
  on_rename: () => void;
  on_archive?: () => void;
  on_unarchive?: () => void;
  on_delete: () => void;
}

const menu_item_class =
  "block w-full cursor-pointer rounded-[0.45rem] border-0 bg-transparent px-2.5 py-1.5 text-left font-inherit text-[0.85rem] text-inherit hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-55";

/**
 * Hamburger menu for sheet actions such as rename.
 */
export function SheetActionsMenu({
  sheet_name,
  is_pending,
  can_delete,
  is_archived = false,
  on_rename,
  on_archive,
  on_unarchive,
  on_delete,
}: Readonly<SheetActionsMenuProps>) {
  const [is_open, setIs_open] = useState(false);
  const menu_ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!is_open) {
      return;
    }

    const handle_pointer_down = (event: PointerEvent): void => {
      if (
        menu_ref.current !== null &&
        !menu_ref.current.contains(event.target as Node)
      ) {
        setIs_open(false);
      }
    };

    document.addEventListener("pointerdown", handle_pointer_down);

    return () => {
      document.removeEventListener("pointerdown", handle_pointer_down);
    };
  }, [is_open]);

  const close_menu = (): void => {
    setIs_open(false);
  };

  return (
    <div className="relative shrink-0 self-center" ref={menu_ref}>
      <button
        type="button"
        className="inline-flex cursor-pointer appearance-none items-center justify-center rounded-none border-0 bg-transparent p-0.5 text-muted shadow-none hover:opacity-75 focus-visible:outline-2 focus-visible:outline-input-focus-border focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-55"
        aria-label={`Actions for sheet ${sheet_name}`}
        aria-expanded={is_open}
        aria-haspopup="menu"
        disabled={is_pending}
        onClick={() => setIs_open((open) => !open)}
      >
        <HamburgerIcon />
      </button>
      {is_open ? (
        <ul
          className="absolute right-0 top-full z-10 mt-1.5 min-w-56 list-none rounded-md border border-panel-border bg-panel p-1.5 shadow-md"
          role="menu"
        >
          <li role="none">
            <button
              type="button"
              className={menu_item_class}
              role="menuitem"
              disabled={is_pending}
              onClick={() => {
                close_menu();
                on_rename();
              }}
            >
              Rename
            </button>
          </li>
          {is_archived ? (
            <li role="none">
              <button
                type="button"
                className={menu_item_class}
                role="menuitem"
                disabled={is_pending || on_unarchive === undefined}
                onClick={() => {
                  close_menu();
                  on_unarchive?.();
                }}
              >
                Restore sheet
              </button>
            </li>
          ) : (
            <li role="none">
              <button
                type="button"
                className={menu_item_class}
                role="menuitem"
                disabled={is_pending || on_archive === undefined}
                onClick={() => {
                  close_menu();
                  on_archive?.();
                }}
              >
                Archive sheet
              </button>
            </li>
          )}
          <li
            className="my-1 border-t border-panel-border"
            role="separator"
            aria-hidden="true"
          />
          <li role="none">
            <button
              type="button"
              className={`${menu_item_class} text-danger`}
              role="menuitem"
              disabled={is_pending || !can_delete}
              title={can_delete ? undefined : "Cannot delete the last sheet"}
              onClick={() => {
                close_menu();
                on_delete();
              }}
            >
              Delete sheet
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
