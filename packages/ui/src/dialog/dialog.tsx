// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useEffect, useRef } from "react";
import { dialogBaseStyle } from "./styles.js";
import type { DialogProps } from "./types.js";

// A modal dialog that opens as soon as it is shown. The browser's native dialog provides focus
// trapping, Escape and the backdrop; this component adds the open on mount and the backdrop dismissal.
export const Dialog = ({
  labelledBy,
  onClose,
  dialogRef,
  className,
  style,
  dismissOnBackdropClick = false,
  testId,
  children,
}: DialogProps) => {
  const ownRef = useRef<HTMLDialogElement>(null);
  const ref = dialogRef ?? ownRef;

  useEffect(() => {
    ref.current?.showModal?.();
  }, [ref]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      className={className}
      style={{ ...dialogBaseStyle, ...style }}
      onClose={onClose}
      onClick={
        dismissOnBackdropClick
          ? (event) => {
              if (event.target === ref.current) {
                ref.current?.close();
              }
            }
          : undefined
      }
      data-testid={testId}
    >
      {children}
    </dialog>
  );
};
