// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { useLocation } from "react-router-dom";

type AuthPlaceholderPageProps = {
  readonly headingTextId: "signIn.heading" | "createAccount.heading";
};

// Stands in for the sign-in and account screens, which are separate issues. It shows
// the reason a person was sent here, so the session guards can be used before those
// screens exist.
export const AuthPlaceholderPage = ({ headingTextId }: AuthPlaceholderPageProps) => {
  const reason = (useLocation().state as { readonly reason?: unknown } | null)?.reason;

  return (
    <>
      {reason === "sessionEnded" && (
        <div role="alert">
          <Text variant="status" textId="session.signedOut" />
        </div>
      )}
      <Text variant="heading" textId={headingTextId} />
      <Text variant="body" textId="authPlaceholder.notReady" />
    </>
  );
};
