// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Dialog, Text } from "@offgrid/ui";
import {
  updateConfirmDialogStyle,
  updateConfirmFooterStyle,
  updateConfirmTextStyle,
} from "./styles.js";
import type { UpdateConfirmDialogProps } from "./types.js";

export const UpdateConfirmDialog = ({ version, onCancel, onConfirm }: UpdateConfirmDialogProps) => (
  <Dialog
    style={updateConfirmDialogStyle}
    backdrop="glossy"
    labelledBy="admin-update-confirm-heading"
    onClose={onCancel}
    testId="admin-update-confirm"
  >
    <div style={updateConfirmTextStyle}>
      <div id="admin-update-confirm-heading">
        <Text variant="subheading" textId="admin.update.confirmHeading" values={{ version }} />
      </div>
      <Text variant="body" textId="admin.update.confirmBody" />
    </div>
    <div style={updateConfirmFooterStyle}>
      <Button type="button" variant="ghost" onClick={onCancel}>
        <Text variant="action" textId="admin.cancel" />
      </Button>
      <Button type="button" variant="primary" onClick={onConfirm}>
        <Text variant="action" textId="admin.update.confirmAction" />
      </Button>
    </div>
  </Dialog>
);
