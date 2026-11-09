// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { useState } from "react";
import { webAdminClient } from "../../../../api/web-api-client.js";
import { adminActionsStyle, adminPersonMetaStyle, adminPersonRowStyle } from "../../styles.js";
import type { AdminPersonRowProps } from "./types.js";

export const AdminPersonRow = ({
  user,
  isLastActiveAdmin,
  onChanged,
  onResetCode,
}: AdminPersonRowProps) => {
  const [confirmingDisable, setConfirmingDisable] = useState(false);
  const isDisabled = user.status === "disabled";
  const cannotDisable = isLastActiveAdmin && user.instanceRole === "admin" && !isDisabled;

  const [actionFailed, setActionFailed] = useState(false);

  const setDisabled = async (disabled: boolean) => {
    setActionFailed(false);
    try {
      if (disabled) {
        await webAdminClient.disableUser(user.id);
      } else {
        await webAdminClient.enableUser(user.id);
      }
      setConfirmingDisable(false);
      onChanged();
    } catch {
      setActionFailed(true);
    }
  };

  const startReset = async () => {
    setActionFailed(false);
    try {
      const issued = await webAdminClient.startPasswordReset(user.id);
      onResetCode({ userId: user.id, displayName: user.displayName, code: issued.code });
    } catch {
      setActionFailed(true);
    }
  };

  return (
    <div style={adminPersonRowStyle} data-testid={`admin-person-${user.id}`}>
      <div style={adminPersonMetaStyle}>
        <Text variant="label" value={user.displayName} />
        <Text variant="status" value={user.email} />
        <Text
          variant="caption"
          textId={isDisabled ? "admin.statusDisabled" : "admin.statusActive"}
        />
        {cannotDisable && <Text variant="caption" textId="admin.lastAdminExplanation" />}
      </div>
      <div style={adminActionsStyle}>
        {isDisabled && (
          <Button variant="secondary" onClick={() => void setDisabled(false)}>
            <Text variant="action" textId="admin.enable" />
          </Button>
        )}
        {!isDisabled && !confirmingDisable && (
          <Button
            variant="secondary"
            disabled={cannotDisable}
            onClick={() => setConfirmingDisable(true)}
          >
            <Text variant="action" textId="admin.disable" />
          </Button>
        )}
        {confirmingDisable && (
          <>
            <Button variant="primary" onClick={() => void setDisabled(true)}>
              <Text variant="action" textId="admin.disableConfirm" />
            </Button>
            <Button variant="ghost" onClick={() => setConfirmingDisable(false)}>
              <Text variant="action" textId="admin.cancel" />
            </Button>
          </>
        )}
        <Button variant="secondary" onClick={() => void startReset()}>
          <Text variant="action" textId="admin.resetPassword" />
        </Button>
      </div>
      {actionFailed && <Text variant="error" textId="admin.actionFailed" />}
    </div>
  );
};
