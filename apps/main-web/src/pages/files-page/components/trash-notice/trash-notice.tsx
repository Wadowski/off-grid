// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, MaterialIcon, Text, cssVar } from "@offgrid/ui";
import { trashNoticeStyle, trashNoticeTextStyle } from "./styles.js";
import type { TrashNoticeProps } from "./types.js";

export const TrashNotice = ({ name, onDismiss }: TrashNoticeProps) => (
  <div
    role="status"
    style={name === null ? undefined : trashNoticeStyle}
    data-testid="files-trash-notice"
  >
    {name === null ? null : (
      <>
        <span style={trashNoticeTextStyle}>
          <Text variant="status" textId="files.delete.notice" values={{ name }} />
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          ariaLabelTextId="files.delete.noticeDismiss"
          onClick={onDismiss}
          data-testid="files-trash-notice-dismiss"
        >
          <MaterialIcon name="close" size="1.25rem" color={cssVar("color-muted")} />
        </Button>
      </>
    )}
  </div>
);
