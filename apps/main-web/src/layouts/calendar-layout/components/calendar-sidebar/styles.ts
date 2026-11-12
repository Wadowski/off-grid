// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";

// The top offset clears the fixed app header (3.5rem) and the page's top spacing.
export const calendarSidebarCss = `
.og-calendar-sidebar {
  display: grid;
  align-content: start;
  align-self: start;
  position: sticky;
  top: calc(3.5rem + ${tokens.space[4]});
  gap: ${tokens.space[3]};
  box-sizing: border-box;
  padding: ${tokens.space[4]} ${tokens.space[3]};
  border-radius: ${tokens.radius.lg};
  background: ${cssVar("color-surface")};
  color: ${cssVar("color-fg")};
  box-shadow: ${cssVar("elevation-1")};
  min-width: 0;
}

.og-calendar-sidebar-slot {
  display: grid;
  gap: ${tokens.space[2]};
}

.og-calendar-sidebar-row {
  display: flex;
  align-items: center;
  gap: ${tokens.space[2]};
  min-width: 0;
  min-height: 2.25rem;
  padding: ${tokens.space[1]} ${tokens.space[2]};
  border-radius: ${tokens.radius.md};
  color: ${cssVar("color-fg")};
  text-decoration: none;
}

.og-calendar-sidebar-row:hover {
  background: ${cssVar("color-surface-low")};
}

.og-calendar-sidebar-row[aria-current="page"] {
  background: ${cssVar("color-surface-high")};
}

.og-calendar-sidebar-name {
  flex: 1 1 auto;
  min-width: 0;
}

.og-calendar-sidebar-name > * {
  display: block;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 899px) {
  .og-calendar-sidebar {
    display: none;
  }
}
`;
