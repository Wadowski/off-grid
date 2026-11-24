// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ParseKeys } from "i18next";
import type { RefObject } from "react";

export type MenuTone = "default" | "danger";

export type MenuItem = {
  readonly id: string;
  readonly textId: ParseKeys;
  readonly icon: string;
  readonly tone: MenuTone;
  readonly testId: string;
  readonly onSelect: () => void;
};

export type MenuProps = {
  readonly label: string;
  readonly items: readonly MenuItem[];
  readonly triggerTestId: string;
  readonly menuTestId: string;
  readonly triggerRef?: RefObject<HTMLButtonElement | null>;
};

export type MenuPosition = {
  readonly top: number;
  readonly left: number;
};

export type MenuTriggerRect = {
  readonly top: number;
  readonly bottom: number;
  readonly right: number;
};

export type MenuPanelSize = {
  readonly width: number;
  readonly height: number;
};

export type MenuViewport = MenuPanelSize;

export type MenuKey = "ArrowDown" | "ArrowUp" | "Home" | "End";
