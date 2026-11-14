// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { newEventActionsStyle, newEventFooterStyle } from "./styles.js";
import type { NewEventFooterProps } from "./types.js";

export const NewEventFooter = ({ cancelButton, createButton }: NewEventFooterProps) => (
  <footer style={newEventFooterStyle}>
    {cancelButton}
    <div style={newEventActionsStyle}>{createButton}</div>
  </footer>
);
