// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, MaterialIcon, Text, cssVar } from "@offgrid/ui";
import { trashNoticeStyle, trashNoticeTextStyle } from "../trash-notice/styles.js";
import type { MoveResultNoticeProps } from "./types.js";

export const MoveResultNotice = ({ notice, onDismiss }: MoveResultNoticeProps) => {
  if (notice === null) {
    return null;
  }
  return (
    <div role="status" style={trashNoticeStyle} data-testid="files-move-notice">
      <span style={trashNoticeTextStyle}>
        <Text
          variant="status"
          textId={notice.crossOwnerNotice ? "files.move.crossOwnerNotice" : "files.move.notice"}
          values={{ name: notice.entryName, target: notice.targetName }}
        />
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        ariaLabelTextId="files.delete.noticeDismiss"
        onClick={onDismiss}
        data-testid="files-move-notice-dismiss"
      >
        <MaterialIcon name="close" size="1.25rem" color={cssVar("color-muted")} />
      </Button>
    </div>
  );
};
