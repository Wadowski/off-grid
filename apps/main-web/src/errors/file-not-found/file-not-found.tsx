// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { Link } from "react-router-dom";
import { fileNotFoundLinkStyle, fileNotFoundStyle } from "./styles.js";

export const FileNotFound = () => (
  <div style={fileNotFoundStyle} data-testid="file-not-found">
    <Text variant="heading" textId="files.fileNotFound.heading" />
    <Text variant="body" textId="files.errors.notFound" />
    <Link
      to="/files"
      className="og-focusable"
      style={fileNotFoundLinkStyle}
      data-testid="file-not-found-back"
    >
      <Text variant="action" textId="files.notFound.back" />
    </Link>
  </div>
);
