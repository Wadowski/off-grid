// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { Link } from "react-router-dom";
import { signInLinkStyle } from "./styles.js";

export const SignInLink = () => (
  <Link to="/sign-in" data-testid="sign-in-link" style={signInLinkStyle}>
    <Text variant="action" textId="createAccount.signInLink" />
  </Link>
);
