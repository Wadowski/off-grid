// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { useOutletContext } from "react-router-dom";
import { CreateFamilyForm } from "../../forms/create-family-form/create-family-form.js";
import { signOut } from "../../session/sign-out.js";
import type { FamiliesContext } from "../../types.js";
import { familiesPageStyle } from "../families-page/styles.js";
import { signOutStyle } from "./styles.js";

export const FirstFamilyPage = () => {
  const { createStatus, submitFamily } = useOutletContext<FamiliesContext>();

  return (
    <div style={familiesPageStyle}>
      <Text variant="heading" textId="firstFamily.heading" />
      <Text variant="status" textId="firstFamily.body" />
      <CreateFamilyForm status={createStatus} onSubmit={submitFamily} />
      <Text variant="status" textId="firstFamily.invitedNote" />
      <div style={signOutStyle}>
        <Button type="button" onClick={() => void signOut()} data-testid="first-family-sign-out">
          <Text variant="action" textId="userMenu.signOut" />
        </Button>
      </div>
    </div>
  );
};
