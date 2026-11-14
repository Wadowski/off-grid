// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useEffect, useRef } from "react";
import { dialogBaseStyle } from "./styles.js";
import type { DialogProps } from "./types.js";

const dialogClassName = (glossy: boolean, className: string | undefined): string | undefined => {
  if (!glossy) {
    return className;
  }
  return className === undefined ? "og-dialog-glossy" : `og-dialog-glossy ${className}`;
};

export const Dialog = ({
  labelledBy,
  onClose,
  dialogRef,
  className,
  style,
  backdrop = "plain",
  dismissOnBackdropClick = false,
  testId,
  children,
}: DialogProps) => {
  const ownRef = useRef<HTMLDialogElement>(null);
  const ref = dialogRef ?? ownRef;

  useEffect(() => {
    ref.current?.showModal();
  }, [ref]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      className={dialogClassName(backdrop === "glossy", className)}
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
