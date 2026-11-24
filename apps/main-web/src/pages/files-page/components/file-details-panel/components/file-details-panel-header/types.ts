// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileDetailsPanelSummary } from "../../types.js";

export type FileDetailsPanelHeaderProps = {
  readonly nameId: string;
  readonly summary: FileDetailsPanelSummary | null;
  readonly onClose: () => void;
};
