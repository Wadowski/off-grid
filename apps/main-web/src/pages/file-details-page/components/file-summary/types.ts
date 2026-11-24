// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileKind } from "@offgrid/ui";

export type FileSummaryProps = {
  readonly name: string;
  readonly kind: FileKind;
};
