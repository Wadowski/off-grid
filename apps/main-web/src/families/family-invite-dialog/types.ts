// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type FamilyInviteDialogProps = {
  readonly familyId: string;
  readonly onClose: () => void;
};

export type FamilyInviteErrorTextId = "familyManager.inviteFailed" | "familyManager.revokeFailed";
