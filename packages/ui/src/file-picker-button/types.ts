// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReactNode } from "react";
import type { ButtonSize, ButtonVariant } from "../button/types.js";

export type FilePickerButtonProps = {
  readonly children: ReactNode;
  readonly ariaLabel?: string;
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly disabled?: boolean;
  readonly onFilesPicked: (files: readonly File[]) => void;
  readonly testId?: string;
  readonly inputTestId?: string;
};
