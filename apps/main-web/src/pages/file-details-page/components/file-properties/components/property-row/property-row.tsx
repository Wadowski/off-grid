// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { propertyLabelStyle, propertyRowStyle, propertyValueStyle } from "./styles.js";
import type { PropertyRowProps } from "./types.js";

export const PropertyRow = ({ testId, labelTextId, isFirst, children }: PropertyRowProps) => (
  <div style={propertyRowStyle(isFirst)} data-testid={testId}>
    <dt style={propertyLabelStyle}>
      <Text variant="label" textId={labelTextId} />
    </dt>
    <dd style={propertyValueStyle}>{children}</dd>
  </div>
);
