// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { useNavigate, useOutletContext } from "react-router-dom";
import { JOIN_FAMILY_PATH } from "../../constants.js";
import { CreateFamilyForm } from "../../forms/create-family-form/create-family-form.js";
import { signOut } from "../../session/sign-out.js";
import type { FamiliesContext } from "../../types.js";
import { AccountIntro } from "../create-account-page/components/account-intro/account-intro.js";
import { familiesPageStyle } from "../families-page/styles.js";
import { signOutStyle } from "./styles.js";

export const FirstFamilyPage = () => {
  const { createStatus, submitFamily } = useOutletContext<FamiliesContext>();
  const navigate = useNavigate();

  return (
    <div style={familiesPageStyle}>
      <AccountIntro
        icon="diversity_3"
        pillTextId="firstFamily.pill"
        headingTextId="firstFamily.heading"
        bodyTextId="firstFamily.body"
      />
      <CreateFamilyForm status={createStatus} onSubmit={submitFamily} />
      <Text variant="status" textId="firstFamily.invitedNote" />
      <Button
        type="button"
        variant="secondary"
        fullWidth
        onClick={() => navigate(JOIN_FAMILY_PATH)}
      >
        <Text variant="action" textId="firstFamily.joinWithCode" />
      </Button>
      <div style={signOutStyle}>
        <Button
          type="button"
          variant="ghost"
          onClick={() => void signOut()}
          data-testid="first-family-sign-out"
        >
          <Text variant="action" textId="userMenu.signOut" />
        </Button>
      </div>
    </div>
  );
};
