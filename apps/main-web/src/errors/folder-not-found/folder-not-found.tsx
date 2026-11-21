// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { Link } from "react-router-dom";
import { folderNotFoundLinkStyle, folderNotFoundStyle } from "./styles.js";

export const FolderNotFound = () => (
  <div style={folderNotFoundStyle} data-testid="folder-not-found">
    <Text variant="heading" textId="files.notFound.heading" />
    <Text variant="body" textId="files.errors.notFound" />
    <Link
      to="/files"
      className="og-focusable"
      style={folderNotFoundLinkStyle}
      data-testid="folder-not-found-back"
    >
      <Text variant="action" textId="files.notFound.back" />
    </Link>
  </div>
);
