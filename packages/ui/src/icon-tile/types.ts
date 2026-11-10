// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReactNode } from "react";

export type IconTileShape = "rounded" | "circle";

export type IconTileProps = {
  readonly size: string;
  readonly shape?: IconTileShape;
  readonly background: string;
  readonly color: string;
  readonly children: ReactNode;
};
