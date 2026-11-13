// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { filterChipBaseStyle, filterChipDotStyle, filterChipSelectedStyle } from "./styles.js";
import type { FilterChipProps } from "./types.js";

export const FilterChip = ({ label, selected, onToggle, dotColor, ...rest }: FilterChipProps) => (
  <button
    type="button"
    className="og-focusable"
    aria-pressed={selected}
    style={selected ? { ...filterChipBaseStyle, ...filterChipSelectedStyle } : filterChipBaseStyle}
    onClick={onToggle}
    {...rest}
  >
    {dotColor === undefined ? null : (
      <span aria-hidden="true" style={{ ...filterChipDotStyle, background: dotColor }} />
    )}
    {label}
  </button>
);
