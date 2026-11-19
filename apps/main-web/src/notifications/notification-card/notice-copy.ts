// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { NotificationType } from "@offgrid/contracts";
import type { NoticeCopy } from "./types.js";

export const noticeCopy = (type: NotificationType): NoticeCopy => {
  switch (type) {
    case "password-changed":
      return {
        titleId: "notifications.types.password-changed.title",
        bodyId: "notifications.types.password-changed.body",
        iconName: "key",
      };
    case "recovery-code-regenerated":
      return {
        titleId: "notifications.types.recovery-code-regenerated.title",
        bodyId: "notifications.types.recovery-code-regenerated.body",
        iconName: "encrypted",
      };
    case "event-invited":
      return {
        titleId: "notifications.types.event-invited.title",
        bodyId: "notifications.types.event-invited.body",
        iconName: "calendar_clock",
        actionId: "notifications.actions.viewEvent",
      };
    case "event-reminder":
      return {
        titleId: "notifications.types.event-reminder.title",
        bodyId: "notifications.types.event-reminder.body",
        iconName: "calendar_clock",
        actionId: "notifications.actions.viewEvent",
      };
  }
};
