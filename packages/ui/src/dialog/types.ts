// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties, ReactNode, RefObject } from "react";

export type DialogProps = {
  // The id of the element that names the dialog.
  readonly labelledBy: string;
  // Called when the dialog closes, whatever closed it (a close control, Escape or the backdrop).
  readonly onClose: () => void;
  // Lets the owner close the dialog. The dialog is still opened on mount without it.
  readonly dialogRef?: RefObject<HTMLDialogElement | null>;
  readonly className?: string;
  readonly style?: CSSProperties;
  // Closes the dialog when a click lands on its backdrop, outside its content.
  readonly dismissOnBackdropClick?: boolean;
  readonly testId?: string;
  readonly children: ReactNode;
};
