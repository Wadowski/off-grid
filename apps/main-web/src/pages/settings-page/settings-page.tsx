// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { MaterialIcon } from "../../icons/material-icon/material-icon.js";
import { initialsOf } from "../../session/initials-of.js";
import { signOut } from "../../session/sign-out.js";
import { useSession } from "../../session/use-session.js";
import { SettingsProfileCard } from "./components/settings-profile-card/settings-profile-card.js";
import { SettingsSection } from "./components/settings-section/settings-section.js";
import { SETTINGS_SECTIONS } from "./constants.js";
import { settingsPageStyle, signOutIconColor, signOutRowStyle } from "./styles.js";

export const SettingsPage = () => {
  const session = useSession();
  if (session.status !== "signedIn") {
    return null;
  }
  const { displayName, email, instanceRole } = session.user;

  return (
    <div style={settingsPageStyle}>
      <Text variant="heading" textId="settings.heading" />
      <SettingsProfileCard
        initials={initialsOf(displayName)}
        displayName={displayName}
        email={email}
        roleTextId={instanceRole === "admin" ? "userMenu.roleAdmin" : "userMenu.roleMember"}
      />
      {SETTINGS_SECTIONS.map((section) => (
        <SettingsSection key={section.labelTextId} section={section} />
      ))}
      <div style={signOutRowStyle}>
        <Button variant="ghost" onClick={() => void signOut()}>
          <MaterialIcon name="lock_reset" size="20px" color={signOutIconColor} />
          <Text variant="error" textId="settings.signOut" />
        </Button>
      </div>
    </div>
  );
};
