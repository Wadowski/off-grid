// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Card, IconTile, Tag, Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { MaterialIcon } from "../../../../icons/material-icon/material-icon.js";
import {
  invitationIconColor,
  invitationIconTileBackground,
  invitationInviterStyle,
  invitationNameStyle,
  invitationPreviewStyle,
  invitationSummaryStyle,
} from "./styles.js";
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
    <div style={invitationPreviewStyle}>
      <Card>
        <div style={invitationSummaryStyle}>
          <IconTile
            size="2.5rem"
            background={invitationIconTileBackground}
            color={invitationIconColor}
          >
            <MaterialIcon name="house" size="20px" color="var(--og-color-accent)" />
          </IconTile>
          <div style={invitationNameStyle}>
            <Text variant="subheading" value={preview.familyName} />
            <Text variant="caption" value={t("joinSpace.createdOn", { date: createdOn })} />
          </div>
          <Tag tone="accent">{t("userMenu.roleMember")}</Tag>
        </div>
        <div style={invitationInviterStyle}>
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
