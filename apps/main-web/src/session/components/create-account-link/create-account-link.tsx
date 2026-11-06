// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { Link } from "react-router-dom";
import { createAccountLinkStyle } from "./styles.js";

export const CreateAccountLink = () => (
  <Link to="/create-account" data-testid="create-account-link" style={createAccountLinkStyle}>
    <Text variant="label" textId="signIn.createLink" />
  </Link>
);
