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

.og-app-nav-item-mobile-only {
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

.og-user-menu-trigger {
  display: flex;
  align-items: center;
  gap: ${tokens.space[7]};
  width: 100%;
  padding: ${tokens.space[2]};
  border: 0;
  border-radius: ${tokens.radius.lg};
  background: var(--og-color-surface-low);
  color: var(--og-color-fg);
  font-family: inherit;
  text-align: start;
  cursor: pointer;
}

.og-user-menu-trigger:hover {
  background: var(--og-color-surface-high);
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
  min-width: 0;
}

.og-user-menu-expand {
  display: inline-flex;
  color: var(--og-color-muted);
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
  position: relative;
  display: flex;
  align-items: center;
}

.og-header-search-icon {
  position: absolute;
  left: ${tokens.space[3]};
  display: inline-flex;
  color: var(--og-color-muted);
  pointer-events: none;
}

.og-header-search-input {
  width: 24rem;
  max-width: 100%;
  padding: 0.375rem 3.5rem 0.375rem 2.25rem;
  border: 0;
  border-radius: ${tokens.radius.md};
  background: color-mix(in srgb, var(--og-color-surface-low) 80%, transparent);
  color: var(--og-color-fg);
  font-family: inherit;
  font-size: ${tokens.font.size["body-sm"]};
  line-height: ${tokens.font.lineHeight["body-sm"]};
  outline: none;
}

.og-header-search-input::placeholder {
  color: var(--og-color-muted);
}

.og-header-search-shortcut {
  position: absolute;
  right: ${tokens.space[2]};
  padding: 0.125rem 0.375rem;
  border-radius: ${tokens.radius.sm};
  background: color-mix(in srgb, var(--og-color-surface-2) 60%, transparent);
  color: var(--og-color-muted);
  font-family: ${tokens.font.family.mono};
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

.og-header-icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 0;
  border-radius: ${tokens.radius.md};
  background: transparent;
  color: var(--og-color-muted);
  cursor: default;
}

.og-shell-main {
  box-sizing: border-box;
  min-height: 100vh;
  margin-left: ${SIDEBAR_WIDTH};
  padding: calc(${HEADER_HEIGHT} + ${tokens.space[4]}) 1.5rem ${tokens.space[6]};
}

@media (max-width: 767px) {
  .og-sidebar {
    top: auto;
    right: 0;
    width: auto;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    box-shadow: none;
    border-top: 1px solid var(--og-color-line);
    backdrop-filter: none;
    background: var(--og-color-surface);
  }

  .og-sidebar-brand,
  .og-sidebar-divider,
  .og-family-card,
  .og-settings-link,
  .og-user-menu-meta,
  .og-user-menu-expand {
    display: none;
  }

  .og-app-nav {
    flex: 1;
    flex-direction: row;
    justify-content: space-around;
    gap: 0;
    padding: ${tokens.space[1]};
  }

  .og-app-nav-item-mobile-only {
    display: flex;
  }

  .og-app-nav-item {
    flex-direction: column;
    gap: 0.125rem;
    padding: ${tokens.space[1]} ${tokens.space[1]};
    font-size: ${tokens.font.size["label-sm"]};
  }

  .og-sidebar-bottom {
    margin-top: 0;
    padding: ${tokens.space[1]} ${tokens.space[2]};
  }

  .og-user-menu-trigger {
    width: auto;
    padding: 0;
    background: transparent;
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
