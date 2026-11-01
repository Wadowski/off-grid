// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const appShellStyle: CSSProperties = {
  minHeight: "100vh",
  fontFamily: tokens.font.family.base,
  background: "var(--og-color-bg)",
  color: "var(--og-color-fg)",
};

export const appShellMainStyle: CSSProperties = {
  maxWidth: "40rem",
  margin: "0 auto",
  padding: tokens.space[5],
};

export const appShellCss = `
.og-app-nav {
  display: flex;
  gap: ${tokens.space[2]};
}

.og-app-nav a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  min-width: 2.75rem;
  padding: 0 ${tokens.space[3]};
  border-radius: ${tokens.radius.md};
  color: var(--og-color-fg);
  font-weight: ${tokens.font.weight.semibold};
  text-decoration: none;
}

.og-app-nav a[aria-current="page"] {
  color: var(--og-color-accent);
}

@media (max-width: 767px) {
  .og-app-nav {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
    justify-content: space-around;
    padding: ${tokens.space[2]};
    background: var(--og-color-surface);
    border-top: 1px solid var(--og-color-muted);
  }

  .og-app-nav a {
    flex: 1;
  }

  .og-app-shell-main {
    padding-bottom: 6rem;
  }
}
`;
