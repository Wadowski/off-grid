// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";

export type NotificationsSurfaceFooterTextId =
  "notifications.modal.viewAll" | "notifications.popover.viewAll";

export type NotificationsSurfaceFooterProps = {
  readonly onViewAll: () => void;
  readonly variant: "primary" | "secondary";
  readonly testId: string;
  readonly textId: NotificationsSurfaceFooterTextId;
  readonly style?: CSSProperties;
};
