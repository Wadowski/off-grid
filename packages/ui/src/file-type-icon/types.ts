// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileKind } from "../files/types.js";

export type FileTypeIconSize = "sm" | "md" | "lg";

export type FileTypeIconProps = {
  readonly kind: FileKind;
  readonly size?: FileTypeIconSize;
  readonly labelled?: boolean;
};
