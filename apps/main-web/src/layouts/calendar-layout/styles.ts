// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";

export const calendarLayoutCss = `
.og-calendar-layout {
  display: grid;
  grid-template-columns: 14rem minmax(0, 1fr);
  align-items: start;
  gap: ${tokens.space[6]};
}

.og-calendar-layout-content {
  min-width: 0;
}

@media (max-width: 899px) {
  .og-calendar-layout {
    grid-template-columns: minmax(0, 1fr);
  }
}
`;
