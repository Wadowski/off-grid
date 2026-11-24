// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReactNode } from "react";

export type FloatingPanelPlacement = "corner" | "sheet";

export type FloatingPanelShape = "card" | "pill";

export type FloatingPanelTone = "surface" | "inverse";

export type FloatingPanelProps = {
  readonly placement: FloatingPanelPlacement;
  readonly shape?: FloatingPanelShape;
  readonly tone?: FloatingPanelTone;
  readonly labelledBy: string;
  readonly onEscape?: () => void;
  readonly testId?: string;
  readonly children: ReactNode;
};
