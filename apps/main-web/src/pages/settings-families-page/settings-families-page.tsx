// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { ApiError } from "@offgrid/api-client";
import { leaveFamily } from "../../families/leave-family.js";
import {
  setSessionActiveFamilyId,
  switchActiveFamily,
} from "../../families/switch-active-family.js";
import { SettingsSubpage } from "../../layouts/settings-subpage/settings-subpage.js";
import { useSession } from "../../session/use-session.js";
import type { FamiliesContext } from "../../types.js";
import { FamilySpaceRow } from "./components/family-space-row/family-space-row.js";
import type { SpaceErrorTextId } from "./types.js";
import { familySpaceErrorStyle, familySpaceListStyle, familySpacesHeaderStyle } from "./styles.js";

export const SettingsFamiliesPage = () => {
  const { families, listStatus, refreshFamilies } = useOutletContext<FamiliesContext>();
  const session = useSession();
  const navigate = useNavigate();
  const [errorTextId, setErrorTextId] = useState<SpaceErrorTextId | undefined>(undefined);

  if (session.status !== "signedIn") {
    return null;
  }
  const { activeFamilyId, user } = session;

  const switchSpace = async (familyId: string) => {
    setErrorTextId(undefined);
    try {
      await switchActiveFamily(familyId);
    } catch {
      setErrorTextId("families.switchFailed");
    }
  };

  const leaveSpace = async (familyId: string) => {
    setErrorTextId(undefined);
    const remaining = families.filter((family) => family.id !== familyId);
    try {
      await leaveFamily(familyId, user.id);
    } catch (error) {
      setErrorTextId(
        error instanceof ApiError && error.code === "LAST_ADMIN"
          ? "families.leaveLastAdmin"
          : "families.leaveFailed",
      );
      return;
    }
    await refreshFamilies();
    if (activeFamilyId === familyId) {
      setSessionActiveFamilyId(remaining[0]?.id ?? null);
    }
  };

  return (
    <SettingsSubpage titleTextId="settings.familyLabel">
      <div style={familySpacesHeaderStyle}>
        <Text variant="subheading" textId="families.spacesHeading" />
        <Button variant="secondary" onClick={() => navigate("/families/new")}>
          <Text variant="action" textId="families.addSpace" />
        </Button>
      </div>
      {listStatus === "loading" && <Text variant="status" textId="families.loading" />}
      {listStatus === "failed" && <Text variant="error" textId="families.listFailed" />}
      {listStatus === "ready" && (
        <ul data-testid="family-space-list" style={familySpaceListStyle}>
          {families.map((space) => (
            <FamilySpaceRow
              key={space.id}
              space={space}
              isActive={space.id === activeFamilyId}
              onSwitch={() => void switchSpace(space.id)}
              onLeave={() => void leaveSpace(space.id)}
            />
          ))}
        </ul>
      )}
      {errorTextId !== undefined && (
        <div role="alert" style={familySpaceErrorStyle}>
          <Text variant="error" textId={errorTextId} />
        </div>
      )}
    </SettingsSubpage>
  );
};
