// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { filesPageStyle } from "./styles.js";

export const FilesPage = () => (
  <div style={filesPageStyle} data-testid="files-page">
    <Text variant="heading" textId="files.layout.heading" />
    <Text variant="body" textId="files.layout.placeholder" />
  </div>
);
