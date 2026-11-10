// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { Button, Text } from "@offgrid/ui";
import { useEffect, useRef, useState } from "react";
import { createFamilyInvitation } from "../create-family-invitation.js";
import { revokeFamilyInvitation } from "../revoke-family-invitation.js";
import type { FamilyInviteDialogProps, FamilyInviteErrorTextId } from "./types.js";
import {
  familyInviteActionsStyle,
  familyInviteCodeStyle,
  familyInviteContentStyle,
  familyInviteDialogStyle,
} from "./styles.js";

type Invitation = { readonly invitationId: string; readonly code: string };

export const FamilyInviteDialog = ({ familyId, onClose }: FamilyInviteDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [revoked, setRevoked] = useState(false);
  const [errorTextId, setErrorTextId] = useState<FamilyInviteErrorTextId | undefined>(undefined);

  useEffect(() => {
    dialogRef.current?.showModal?.();
  }, []);

  const create = async () => {
    setErrorTextId(undefined);
    try {
      const created = await createFamilyInvitation(familyId);
      setInvitation({ invitationId: created.invitationId, code: created.code });
      setRevoked(false);
    } catch {
      setErrorTextId("familyManager.inviteFailed");
    }
  };

  const revoke = async () => {
    if (invitation === null) {
      return;
    }
    setErrorTextId(undefined);
    try {
      await revokeFamilyInvitation(familyId, invitation.invitationId);
    } catch (error) {
      if (!(error instanceof ApiError && error.code === "NOT_FOUND")) {
        setErrorTextId("familyManager.revokeFailed");
        return;
      }
    }
    setInvitation(null);
    setRevoked(true);
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="family-invite-heading"
      style={familyInviteDialogStyle}
      onClose={onClose}
      data-testid="family-invite-dialog"
    >
      <div style={familyInviteContentStyle}>
        <h2 id="family-invite-heading">
          <Text variant="subheading" textId="familyManager.inviteHeading" />
        </h2>
        <Text variant="body" textId="familyManager.inviteDescription" />
        {invitation !== null && (
          <>
            <Text variant="caption" textId="familyManager.codeLabel" />
            <output style={familyInviteCodeStyle} data-testid="family-invite-code">
              {invitation.code}
            </output>
            <Text variant="caption" textId="familyManager.codeHint" />
          </>
        )}
        {revoked && <Text variant="status" textId="familyManager.revoked" />}
        {errorTextId !== undefined && (
          <div role="alert">
            <Text variant="error" textId={errorTextId} />
          </div>
        )}
        <div style={familyInviteActionsStyle}>
          {invitation === null ? (
            <Button variant="primary" onClick={() => void create()}>
              <Text variant="action" textId="familyManager.createCode" />
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => void revoke()}>
              <Text variant="error" textId="familyManager.revoke" />
            </Button>
          )}
          <Button variant="secondary" onClick={() => dialogRef.current?.close()}>
            <Text variant="action" textId="familyManager.close" />
          </Button>
        </div>
      </div>
    </dialog>
  );
};
