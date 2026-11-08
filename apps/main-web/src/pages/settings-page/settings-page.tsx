// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { Link } from "react-router-dom";
import { MaterialIcon } from "../../icons/material-icon/material-icon.js";
import { initialsOf } from "../../session/initials-of.js";
import { signOut } from "../../session/sign-out.js";
import { useSession } from "../../session/use-session.js";
import { SETTINGS_LINKS } from "./constants.js";
import {
  settingsAvatarStyle,
  settingsLinkListStyle,
  settingsLinkStyle,
  settingsPageStyle,
  settingsSignOutStyle,
  settingsSummaryStyle,
} from "./styles.js";

export const SettingsPage = () => {
  const session = useSession();
  if (session.status !== "signedIn") {
    return null;
  }
  const { displayName, email, instanceRole } = session.user;

  return (
    <div style={settingsPageStyle}>
      <Text variant="heading" textId="settings.heading" />
      <div style={settingsSummaryStyle}>
        <span style={settingsAvatarStyle} aria-hidden="true">
          {initialsOf(displayName)}
        </span>
        <div>
          <Text variant="label" value={displayName} />
          <Text variant="status" value={email} />
          <Text
            variant="caption"
            textId={instanceRole === "admin" ? "userMenu.roleAdmin" : "userMenu.roleMember"}
          />
        </div>
      </div>
      <ul style={settingsLinkListStyle}>
        {SETTINGS_LINKS.map((link) => (
          <li key={link.path}>
            <Link to={link.path} style={settingsLinkStyle}>
              <Text variant="label" textId={link.labelTextId} />
              <Text variant="status" textId={link.descriptionTextId} />
            </Link>
          </li>
        ))}
      </ul>
      <div style={settingsSignOutStyle}>
        <Button variant="secondary" onClick={() => void signOut()}>
          <MaterialIcon name="logout" size="18px" color="currentColor" />
          <Text variant="action" textId="settings.signOut" />
        </Button>
      </div>
    </div>
  );
};
