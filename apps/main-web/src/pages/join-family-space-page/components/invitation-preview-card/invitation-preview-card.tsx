// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Card, IconTile, Tag, Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { MaterialIcon } from "../../../../icons/material-icon/material-icon.js";
import type { InvitationPreviewCardProps } from "./types.js";

export const InvitationPreviewCard = ({
  preview,
  submitting,
  errorTextId,
  onAccept,
  onDecline,
}: InvitationPreviewCardProps) => {
  const { t, i18n } = useTranslation();
  const createdOn = new Date(preview.familyCreatedAt).toLocaleDateString(i18n.language, {
    dateStyle: "medium",
  });
  const inviterName = preview.invitedBy.displayName;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", textAlign: "left" }}>
      <Card>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", padding: "1rem" }}>
          <IconTile
            size="2.5rem"
            background="var(--og-color-accent-soft)"
            color="var(--og-color-accent)"
          >
            <MaterialIcon name="house" size="20px" color="var(--og-color-accent)" />
          </IconTile>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
            <Text variant="subheading" value={preview.familyName} />
            <Text variant="caption" value={t("joinSpace.createdOn", { date: createdOn })} />
          </div>
          <Tag tone="accent">{t("userMenu.roleMember")}</Tag>
        </div>
        <div style={{ padding: "0 1rem 1rem" }}>
          <Text
            variant="body"
            value={
              inviterName === null
                ? t("joinSpace.invitedByUnknown", { family: preview.familyName })
                : t("joinSpace.invitedBy", { name: inviterName, family: preview.familyName })
            }
          />
        </div>
      </Card>
      {errorTextId !== undefined && (
        <div role="alert">
          <Text variant="error" textId={errorTextId} />
        </div>
      )}
      <Button
        type="button"
        variant="primary"
        fullWidth
        disabled={submitting}
        onClick={() => void onAccept()}
      >
        <Text variant="action" textId="joinSpace.accept" />
      </Button>
      <Button type="button" variant="secondary" fullWidth disabled={submitting} onClick={onDecline}>
        <Text variant="action" textId="joinSpace.decline" />
      </Button>
    </div>
  );
};
