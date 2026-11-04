// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { materialIconStyle } from "./styles.js";
import type { MaterialIconProps } from "./types.js";

export const MaterialIcon = ({ name, size, color, filled = false }: MaterialIconProps) => (
  <span
    aria-hidden="true"
    className="material-symbols-outlined"
    style={materialIconStyle(size, color, filled)}
  >
    {name}
  </span>
);
