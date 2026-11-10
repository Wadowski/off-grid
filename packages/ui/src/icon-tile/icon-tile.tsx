// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { iconTileStyle } from "./styles.js";
import type { IconTileProps } from "./types.js";

export const IconTile = ({
  size,
  shape = "rounded",
  background,
  color,
  children,
}: IconTileProps) => (
  <span style={iconTileStyle(size, shape, background, color)} aria-hidden="true">
    {children}
  </span>
);
