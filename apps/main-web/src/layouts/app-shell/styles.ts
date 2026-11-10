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

const SIDEBAR_WIDTH = "16rem";
const HEADER_HEIGHT = "3.5rem";
const FLOATING_SHADOW = "0 1px 8px color-mix(in srgb, var(--og-color-fg) 4%, transparent)";
const TRANSLUCENT_SURFACE = "color-mix(in srgb, var(--og-color-surface) 75%, transparent)";
const TRANSLUCENT_SIDEBAR = "color-mix(in srgb, var(--og-color-surface-low) 70%, transparent)";

export const appShellCss = `
.og-sidebar {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 50;
  width: ${SIDEBAR_WIDTH};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background: ${TRANSLUCENT_SIDEBAR};
  backdrop-filter: blur(40px);
  box-shadow: ${FLOATING_SHADOW};
}

.og-sidebar-brand {
  display: flex;
  align-items: center;
  gap: ${tokens.space[2]};
  padding: ${tokens.space[4]} ${tokens.space[4]} ${tokens.space[2]};
}

.og-sidebar-brand-mark {
  width: 1.75rem;
  height: 1.75rem;
  flex-shrink: 0;
  object-fit: contain;
}

.og-sidebar-divider {
  height: 1px;
  margin: ${tokens.space[1]} ${tokens.space[4]};
  background: color-mix(in srgb, var(--og-color-line) 60%, transparent);
}

.og-app-nav {
  display: flex;
  flex-direction: column;
  gap: ${tokens.space[1]};
  padding: ${tokens.space[1]} ${tokens.space[2]};
}

.og-app-nav-item {
  display: flex;
  align-items: center;
  gap: ${tokens.space[3]};
  padding: ${tokens.space[2]} ${tokens.space[3]};
  border-radius: ${tokens.radius.md};
  color: var(--og-color-muted);
  text-decoration: none;
}

.og-app-nav-item:not(.og-app-nav-item-disabled):hover {
  background: var(--og-color-surface-high);
  color: var(--og-color-fg);
}

.og-app-nav-item[aria-current="page"] {
  background: var(--og-color-accent);
  color: var(--og-color-accent-fg);
  box-shadow: 0 1px 2px color-mix(in srgb, var(--og-color-fg) 12%, transparent);
}

.og-app-nav-item-disabled {
  color: var(--og-color-outline);
  cursor: default;
}

.og-tab-bar {
  display: none;
}

.og-sidebar-bottom {
  display: flex;
  flex-direction: column;
  gap: ${tokens.space[7]};
  margin-top: auto;
  padding: ${tokens.space[2]};
}

.og-family-card {
  display: flex;
  flex-direction: column;
  gap: ${tokens.space[7]};
  padding: ${tokens.space[3]};
  border: 1px solid color-mix(in srgb, var(--og-color-line) 40%, transparent);
  border-radius: ${tokens.radius.lg};
  background: color-mix(in srgb, var(--og-color-surface) 80%, transparent);
  backdrop-filter: blur(12px);
  box-shadow: 0 2px 12px color-mix(in srgb, var(--og-color-fg) 3%, transparent);
}

.og-family-card-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${tokens.space[2]};
}

.og-family-card-name {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  min-width: 0;
  padding: ${tokens.space[1]} ${tokens.space[2]};
  border-radius: ${tokens.radius.md};
  background: var(--og-color-surface-low);
}

.og-family-card-count {
  display: inline-flex;
  align-items: center;
  gap: ${tokens.space[1]};
  padding: 0.125rem 0.375rem;
  border-radius: ${tokens.radius.full};
  background: color-mix(in srgb, var(--og-color-good) 10%, transparent);
  color: var(--og-color-good);
}

.og-family-card-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: ${tokens.radius.full};
  background: var(--og-color-good);
}

.og-family-card-manage {
  color: var(--og-color-primary);
  text-decoration: none;
}

.og-family-card-manage:hover {
  text-decoration: underline;
}

.og-user-menu-avatar {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: ${tokens.radius.full};
  background: var(--og-color-accent);
  color: var(--og-color-accent-fg);
  font-size: ${tokens.font.size["label-md"]};
  font-weight: ${tokens.font.weight.semibold};
}

.og-user-menu-meta {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  text-align: start;
}

.og-user-menu-expand {
  display: inline-flex;
  color: var(--og-color-muted);
}

.og-user-menu > button {
  width: 100%;
}

.og-settings-link {
  display: flex;
  align-items: center;
  gap: ${tokens.space[2]};
  padding: ${tokens.space[1]} ${tokens.space[2]};
  color: var(--og-color-muted);
  text-decoration: none;
}

.og-settings-link:hover {
  color: var(--og-color-fg);
}

.og-header {
  position: fixed;
  top: 0;
  left: ${SIDEBAR_WIDTH};
  right: 0;
  z-index: 40;
  box-sizing: border-box;
  height: ${HEADER_HEIGHT};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${tokens.space[4]};
  padding: 0 1.5rem;
  background: ${TRANSLUCENT_SURFACE};
  backdrop-filter: blur(24px);
  box-shadow: ${FLOATING_SHADOW};
}

.og-header-start {
  display: flex;
  align-items: center;
  gap: ${tokens.space[4]};
  min-width: 0;
}

.og-header-brand {
  display: none;
  width: 2rem;
  height: 2rem;
}

.og-header-search {
  width: 24rem;
  max-width: 100%;
}

.og-header-actions {
  display: flex;
  align-items: center;
  gap: ${tokens.space[3]};
}

.og-header-pill {
  display: inline-flex;
  align-items: center;
  gap: ${tokens.space[1]};
  padding: ${tokens.space[1]} ${tokens.space[2]} ${tokens.space[1]};
  border-radius: ${tokens.radius.md};
  background: var(--og-color-surface-low);
  color: var(--og-color-muted);
}

.og-shell-main {
  box-sizing: border-box;
  min-height: 100vh;
  margin-left: ${SIDEBAR_WIDTH};
  padding: calc(${HEADER_HEIGHT} + ${tokens.space[4]}) 1.5rem ${tokens.space[6]};
}

@media (max-width: 767px) {
  .og-sidebar {
    display: none;
  }

  .og-tab-bar {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 50;
    box-sizing: border-box;
    display: flex;
    justify-content: space-around;
    gap: ${tokens.space[2]};
    padding: ${tokens.space[2]} ${tokens.space[4]} ${tokens.space[3]};
    border-top: 1px solid var(--og-color-surface-high);
    background: color-mix(in srgb, var(--og-color-surface) 90%, transparent);
    backdrop-filter: blur(12px);
  }

  .og-tab-bar-item {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    gap: 0.25rem;
    color: var(--og-color-muted);
    font-size: ${tokens.font.size["label-sm"]};
    font-weight: ${tokens.font.weight.medium};
    text-decoration: none;
  }

  .og-tab-bar-item:hover {
    color: var(--og-color-primary);
  }

  .og-tab-bar-item[aria-current="page"] {
    color: var(--og-color-primary);
    font-weight: ${tokens.font.weight.semibold};
  }

  .og-header {
    left: 0;
  }

  .og-header-brand {
    display: block;
  }

  .og-header-search,
  .og-header-pill,
  .og-header-apps {
    display: none;
  }

  .og-shell-main {
    margin-left: 0;
    padding: calc(${HEADER_HEIGHT} + ${tokens.space[4]}) ${tokens.space[4]} 6rem;
  }
}
`;
