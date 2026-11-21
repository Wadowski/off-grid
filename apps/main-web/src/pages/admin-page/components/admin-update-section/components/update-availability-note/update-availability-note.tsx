// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { adminNoticeStyle } from "../../../../styles.js";
import type { UpdateAvailabilityNoteProps } from "./types.js";

export const UpdateAvailabilityNote = ({ update }: UpdateAvailabilityNoteProps) => {
  if (update.updateAvailable && update.updateAllowed) {
    return null;
  }
  return (
    <div style={adminNoticeStyle}>
      <Text
        variant="status"
        textId={update.updateAvailable ? "admin.update.notAllowed" : "admin.update.upToDate"}
      />
    </div>
  );
};
