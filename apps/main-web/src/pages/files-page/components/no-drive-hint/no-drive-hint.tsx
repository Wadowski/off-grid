// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { NO_DRIVE_HINT_ID } from "../../../../files/constants.js";
import { noDriveHintStyle } from "./styles.js";

export const NoDriveHint = () => (
  <Text
    variant="caption"
    element="p"
    textId="files.upload.noDrive"
    id={NO_DRIVE_HINT_ID}
    style={noDriveHintStyle}
    data-testid="files-no-drive-hint"
  />
);
