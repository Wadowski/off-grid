// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import type { CurrentUser } from "../../../../types.js";
import { AppNav } from "../app-nav/app-nav.js";
import { UserMenu } from "../user-menu/user-menu.js";
import { appHeaderStyle } from "./styles.js";

type AppHeaderProps = {
  readonly user: CurrentUser;
  readonly onSignOut: () => void;
};

export const AppHeader = ({ user, onSignOut }: AppHeaderProps) => (
  <header style={appHeaderStyle}>
    <Text variant="brand" textId="appName" />
    <AppNav />
    <UserMenu user={user} onSignOut={onSignOut} />
  </header>
);
