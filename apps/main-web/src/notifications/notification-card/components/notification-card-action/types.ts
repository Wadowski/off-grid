// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ParseKeys } from "i18next";

export type NotificationCardActionProps = {
  readonly actionId: ParseKeys;
  readonly onActivate: () => void;
};
