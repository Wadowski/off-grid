// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ParseKeys } from "i18next";
import type { Notice } from "@offgrid/contracts";

export type NotificationCardDensity = "compact" | "full";

export type NotificationCardProps = {
  readonly notice: Notice;
  readonly density: NotificationCardDensity;
  readonly onOpen: (notice: Notice) => void;
  readonly onMarkRead: (noticeId: Notice["id"]) => void;
};

export type NoticeIconName = "key" | "encrypted" | "calendar_clock";

export type NoticeCopy = {
  readonly titleId: ParseKeys;
  readonly bodyId: ParseKeys;
  readonly iconName: NoticeIconName;
  readonly actionId?: ParseKeys;
};
