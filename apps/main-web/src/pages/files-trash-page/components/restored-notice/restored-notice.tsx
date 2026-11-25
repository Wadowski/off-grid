// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, cssVar, MaterialIcon, Text } from "@offgrid/ui";
import { Link } from "react-router-dom";
import { restoredNoticeActionsStyle, restoredNoticeStyle } from "./styles.js";
import type { RestoredNoticeProps } from "./types.js";

export const RestoredNotice = ({ name, path, onDismiss }: RestoredNoticeProps) => (
  <div role="status" style={restoredNoticeStyle} data-testid="trash-restored-notice">
    <Text variant="status" textId="files.trash.restoredNotice" values={{ name }} />
    <div style={restoredNoticeActionsStyle}>
      <Link to={path} data-testid="trash-restored-link" className="og-focusable">
        <Text variant="link" textId="files.trash.showInDrive" />
      </Link>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        ariaLabelTextId="files.delete.noticeDismiss"
        onClick={onDismiss}
        data-testid="trash-restored-dismiss"
      >
        <MaterialIcon name="close" size="1.25rem" color={cssVar("color-muted")} />
      </Button>
    </div>
  </div>
);
