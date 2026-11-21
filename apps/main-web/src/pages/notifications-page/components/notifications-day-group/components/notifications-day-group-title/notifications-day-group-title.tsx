// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import type { NotificationsDayGroupTitleProps } from "./types.js";

export const NotificationsDayGroupTitle = ({ label }: NotificationsDayGroupTitleProps) =>
  "value" in label ? (
    <Text variant="subheading" value={label.value} />
  ) : (
    <Text variant="subheading" textId={label.textId} values={label.values} />
  );
