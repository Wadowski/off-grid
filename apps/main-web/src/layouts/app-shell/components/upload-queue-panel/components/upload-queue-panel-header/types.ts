// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { RefObject } from "react";
import type { PanelSummary } from "../../types.js";

export type UploadQueuePanelHeaderProps = {
  readonly summary: PanelSummary;
  readonly expanded: boolean;
  readonly controlsId: string;
  readonly isIdle: boolean;
  readonly toggleRef: RefObject<HTMLButtonElement | null>;
  readonly onToggle: () => void;
  readonly onClose: () => void;
};
