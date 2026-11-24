// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { Link } from "react-router-dom";
import { itemNotFoundLinkStyle, itemNotFoundStyle } from "./styles.js";
import type { ItemNotFoundProps } from "./types.js";

const HEADING_TEXT_IDS = {
  file: "files.fileNotFound.heading",
  folder: "files.notFound.heading",
} as const;

export const ItemNotFound = ({ kind }: ItemNotFoundProps) => (
  <div style={itemNotFoundStyle} data-testid={`${kind}-not-found`}>
    <Text variant="heading" textId={HEADING_TEXT_IDS[kind]} />
    <Text variant="body" textId="files.errors.notFound" />
    <Link
      to="/files"
      className="og-focusable"
      style={itemNotFoundLinkStyle}
      data-testid={`${kind}-not-found-back`}
    >
      <Text variant="action" textId="files.notFound.back" />
    </Link>
  </div>
);
