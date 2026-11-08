// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { Link } from "react-router-dom";
import { forgotPasswordLinkStyle } from "./styles.js";

export const ForgotPasswordLink = () => (
  <Link to="/forgot-password" data-testid="forgot-password-link" style={forgotPasswordLinkStyle}>
    <Text variant="label" textId="signIn.forgotLink" />
  </Link>
);
