// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties, ReactNode, RefObject } from "react";

export type DialogProps = {
  readonly labelledBy: string;
  readonly onClose: () => void;
  readonly dialogRef?: RefObject<HTMLDialogElement | null>;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly backdrop?: "plain" | "glossy";
  readonly dismissOnBackdropClick?: boolean;
  readonly testId?: string;
  readonly children: ReactNode;
};
