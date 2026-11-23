// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Card, Text } from "@offgrid/ui";
import { PropertyRow } from "./components/property-row/property-row.js";
import { filePropertiesStyle, filePropertyListStyle } from "./styles.js";
import type { FilePropertiesProps } from "./types.js";

export const FileProperties = ({ rows }: FilePropertiesProps) => (
  <section style={filePropertiesStyle} data-testid="file-properties">
    <Text variant="label" textId="files.details.properties" />
    <Card>
      <dl style={filePropertyListStyle}>
        {rows.map((row, index) => (
          <PropertyRow
            key={row.key}
            testId={`file-details-property-${row.key}`}
            labelTextId={row.labelTextId}
            isFirst={index === 0}
          >
            {row.value}
          </PropertyRow>
        ))}
      </dl>
    </Card>
  </section>
);
