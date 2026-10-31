// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Card, Text } from "@offgrid/ui";
import type { FamilyListItemProps } from "./types.js";

export const FamilyListItem = ({ family }: FamilyListItemProps) => (
  <li data-testid="family-list-item">
    <Card>
      <Text variant="body" value={family.name} />
    </Card>
  </li>
);
