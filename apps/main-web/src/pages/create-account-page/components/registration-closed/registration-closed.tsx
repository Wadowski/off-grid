// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { SignInLink } from "../../../../session/components/sign-in-link/sign-in-link.js";

export const RegistrationClosed = () => (
  <>
    <Text variant="heading" textId="createAccount.closed.heading" />
    <Text variant="body" textId="createAccount.closed.body" />
    <SignInLink />
  </>
);
