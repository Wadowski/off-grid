// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type AppNavLabelTextId =
  | "nav.apps"
  | "nav.family"
  | "nav.calendar"
  | "nav.notes"
  | "nav.smartLists"
  | "nav.vault"
  | "nav.meals"
  | "nav.settings";

export type AppNavItem = {
  readonly id: string;
  readonly labelTextId: AppNavLabelTextId;
  readonly iconName: string;
  readonly path?: string;
  readonly matchSubpaths?: boolean;
};

export const familyNavItem: AppNavItem = {
  id: "family",
  labelTextId: "nav.family",
  iconName: "groups",
  path: "/",
};

export const appNavItems: readonly AppNavItem[] = [
  familyNavItem,
  {
    id: "calendar",
    labelTextId: "nav.calendar",
    iconName: "calendar_today",
    path: "/calendar",
    matchSubpaths: true,
  },
  { id: "notes", labelTextId: "nav.notes", iconName: "description" },
  { id: "smart-lists", labelTextId: "nav.smartLists", iconName: "checklist" },
  { id: "vault", labelTextId: "nav.vault", iconName: "lock" },
  { id: "meals", labelTextId: "nav.meals", iconName: "restaurant" },
];

export const settingsNavItem: AppNavItem = {
  id: "settings",
  labelTextId: "nav.settings",
  iconName: "settings",
  path: "/settings",
};

export const appsNavItem: AppNavItem = {
  id: "apps",
  labelTextId: "nav.apps",
  iconName: "grid_view",
  path: "/apps",
};

export const mobileTabItems: readonly AppNavItem[] = [appsNavItem, familyNavItem, settingsNavItem];
