// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type NotificationsSurface = "popover" | "modal";

export type HeaderBellProps = {
  readonly isOpen: boolean;
  readonly onToggle: () => void;
};
