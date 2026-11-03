// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { useLocation } from "react-router-dom";
import { isSessionEndedState } from "./is-session-ended-state.js";
import type { AuthPlaceholderPageProps } from "./types.js";

export const AuthPlaceholderPage = ({ headingTextId }: AuthPlaceholderPageProps) => {
  const routeState: unknown = useLocation().state;

  return (
    <>
      {isSessionEndedState(routeState) && (
        <div role="alert">
          <Text variant="status" textId="session.signedOut" />
        </div>
      )}
      <Text variant="heading" textId={headingTextId} />
      <Text variant="body" textId="authPlaceholder.notReady" />
    </>
  );
};
