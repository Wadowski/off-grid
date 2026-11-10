// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { selectStyle } from "./styles.js";
import type { SelectProps } from "./types.js";

export const Select = (props: SelectProps) => (
  <select className="og-focusable" style={selectStyle} {...props} />
);
