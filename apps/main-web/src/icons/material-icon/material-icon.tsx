// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { materialIconStyle } from "./styles.js";
import type { MaterialIconProps } from "./types.js";

// The glyph name is drawn by the stylesheet from `data-icon`, so the icon adds no text to the DOM.
export const MaterialIcon = ({ name, size, color, filled = false }: MaterialIconProps) => (
  <span
    aria-hidden="true"
    className="material-symbols-outlined og-material-icon"
    data-icon={name}
    style={materialIconStyle(size, color, filled)}
  />
);
