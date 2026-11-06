// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { MaterialIcon } from "../../../../../../icons/material-icon/material-icon.js";
import type { AppNavLabelProps } from "./types.js";

export const AppNavLabel = ({ item }: AppNavLabelProps) => (
  <>
    <MaterialIcon name={item.iconName} size="18px" color="currentColor" />
    <Text variant="body" textId={item.labelTextId} />
  </>
);
