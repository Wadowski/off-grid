// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { AppNav } from "../app-nav/app-nav.js";
import { UserMenu } from "../user-menu/user-menu.js";
import { SidebarBrand } from "./components/sidebar-brand/sidebar-brand.js";
import { SidebarFamilyCard } from "./components/sidebar-family-card/sidebar-family-card.js";
import { SidebarSettingsLink } from "./components/sidebar-settings-link/sidebar-settings-link.js";
import type { AppSidebarProps } from "./types.js";

export const AppSidebar = ({ user, families, onSignOut }: AppSidebarProps) => (
  <aside className="og-sidebar">
    <SidebarBrand />
    <div className="og-sidebar-divider" aria-hidden="true" />
    <AppNav />
    <div className="og-sidebar-bottom">
      <SidebarFamilyCard families={families} />
      <UserMenu user={user} onSignOut={onSignOut} />
      <SidebarSettingsLink />
    </div>
  </aside>
);
