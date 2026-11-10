// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import type { InvitationPreview } from "@offgrid/contracts";
import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { joinFamily } from "../../families/join-family.js";
import { previewFamilyInvitation } from "../../families/preview-family-invitation.js";
import { switchActiveFamily } from "../../families/switch-active-family.js";
import type { FamiliesContext } from "../../types.js";
import { AccountIntro } from "../create-account-page/components/account-intro/account-intro.js";
import { createFamilySpacePageStyle } from "../create-family-space-page/styles.js";
import { InvitationPreviewCard } from "./components/invitation-preview-card/invitation-preview-card.js";
import { JoinCodeForm } from "./components/join-code-form/join-code-form.js";
import type { JoinErrorTextId } from "./types.js";

const errorTextIdFor = (error: unknown): JoinErrorTextId => {
  if (error instanceof ApiError && error.status === 404) {
    return "joinSpace.invalidCode";
  }
  if (error instanceof ApiError && error.status === 429) {
    return "joinSpace.rateLimited";
  }
  return "joinSpace.failed";
};

export const JoinFamilySpacePage = () => {
  const { refreshFamilies } = useOutletContext<FamiliesContext>();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [errorTextId, setErrorTextId] = useState<JoinErrorTextId | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const showPreview = async (value: string) => {
    const trimmed = value.trim();
    if (trimmed === "") {
      setErrorTextId("joinSpace.codeRequired");
      return;
    }
    setSubmitting(true);
    setErrorTextId(undefined);
    try {
      setPreview(await previewFamilyInvitation(trimmed));
      setCode(trimmed);
    } catch (error) {
      setErrorTextId(errorTextIdFor(error));
    } finally {
      setSubmitting(false);
    }
  };

  const acceptInvitation = async () => {
    setSubmitting(true);
    setErrorTextId(undefined);
    try {
      const joined = await joinFamily(code);
      await switchActiveFamily(joined.familyId);
      await refreshFamilies();
      navigate("/settings/families");
    } catch (error) {
      setErrorTextId(errorTextIdFor(error));
      setSubmitting(false);
    }
  };

  const declineInvitation = () => {
    setPreview(null);
    setCode("");
    setErrorTextId(undefined);
  };

  return (
    <div style={createFamilySpacePageStyle}>
      <AccountIntro
        icon="diversity_3"
        pillTextId="joinSpace.pill"
        headingTextId={preview === null ? "joinSpace.heading" : "joinSpace.previewHeading"}
        bodyTextId={preview === null ? "joinSpace.body" : "joinSpace.previewBody"}
      />
      {preview === null ? (
        <JoinCodeForm submitting={submitting} errorTextId={errorTextId} onSubmit={showPreview} />
      ) : (
        <InvitationPreviewCard
          preview={preview}
          submitting={submitting}
          errorTextId={errorTextId}
          onAccept={acceptInvitation}
          onDecline={declineInvitation}
        />
      )}
    </div>
  );
};
