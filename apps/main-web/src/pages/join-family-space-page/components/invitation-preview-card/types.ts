// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { InvitationPreview } from "@offgrid/contracts";
import type { JoinErrorTextId } from "../../types.js";

export type InvitationPreviewCardProps = {
  readonly preview: InvitationPreview;
  readonly submitting: boolean;
  readonly errorTextId: JoinErrorTextId | undefined;
  readonly onAccept: () => Promise<void>;
  readonly onDecline: () => void;
};
