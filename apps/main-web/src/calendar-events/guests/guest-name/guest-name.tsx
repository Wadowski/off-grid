// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import type { GuestNameProps } from "./types.js";

export const GuestName = ({ name, variant = "body" }: GuestNameProps) =>
  name === undefined ? (
    <Text variant={variant} textId="calendar.guests.unknownName" />
  ) : (
    <Text variant={variant} value={name} />
  );
