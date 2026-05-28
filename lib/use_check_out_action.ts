"use client";

import { useCallback } from "react";

import { useConfirmDialog } from "@/components/confirm-dialog-provider";
import { get_check_out_confirm_dialog } from "@/lib/get_check_out_confirm_dialog";
import { type CheckOutOptions } from "@/lib/types/check_out_options";
import { use_confirm_before_checkout } from "@/lib/use_confirm_before_checkout";

/**
 * Returns a check-out handler that respects the confirm-before-checkout preference.
 */
export function useCheckOutAction(
  on_check_out: (options?: CheckOutOptions) => void,
): (options?: CheckOutOptions) => Promise<boolean> {
  const { confirm } = useConfirmDialog();
  const confirm_before_checkout = use_confirm_before_checkout();

  return useCallback(
    async (options?: CheckOutOptions): Promise<boolean> => {
      if (confirm_before_checkout) {
        const confirmed = await confirm(get_check_out_confirm_dialog(options));

        if (!confirmed) {
          return false;
        }
      }

      on_check_out(options);
      return true;
    },
    [confirm, confirm_before_checkout, on_check_out],
  );
}
