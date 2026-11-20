// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { adminRowStyle } from "../../../../styles.js";
import { updateButtonGroupStyle } from "./styles.js";
import type { UpdateActionsRowProps } from "./types.js";

export const UpdateActionsRow = ({
  isFirst,
  checking,
  canCheck,
  canUpdate,
  updateButtonRef,
  onCheck,
  onUpdate,
}: UpdateActionsRowProps) => (
  <div style={adminRowStyle(isFirst)}>
    <div style={updateButtonGroupStyle}>
      <Button
        type="button"
        variant="secondary"
        fullWidth
        data-testid="admin-update-check"
        disabled={!canCheck}
        onClick={onCheck}
      >
        <Text
          variant="action"
          textId={checking ? "admin.update.checking" : "admin.update.checkButton"}
        />
      </Button>
      <Button
        type="button"
        variant="primary"
        fullWidth
        data-testid="admin-update-start"
        ref={updateButtonRef}
        disabled={!canUpdate}
        onClick={onUpdate}
      >
        <Text variant="action" textId="admin.update.updateButton" />
      </Button>
    </div>
  </div>
);
