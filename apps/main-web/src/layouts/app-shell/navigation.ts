// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type AppNavItem = {
  readonly id: string;
  readonly labelTextId: "nav.family" | "nav.settings";
  readonly path: string;
};

export const appNavItems: readonly AppNavItem[] = [
  { id: "family", labelTextId: "nav.family", path: "/" },
  { id: "settings", labelTextId: "nav.settings", path: "/settings" },
];
