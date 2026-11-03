// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSession } from "./session-store.js";

const SessionLoading = () => <Text variant="status" textId="session.loading" />;

// Protected pages. A person who is not signed in goes to sign-in, with the place they
// asked for remembered so sign-in can return them there. On a fresh server the first
// account is created instead.
export const RequireSignedIn = () => {
  const session = useSession();
  const location = useLocation();

  if (session.status === "loading") {
    return <SessionLoading />;
  }
  if (session.status === "signedOut") {
    if (session.freshServer) {
      return <Navigate to="/create-account" replace state={{ firstRun: true }} />;
    }
    return (
      <Navigate
        to="/sign-in"
        replace
        state={{
          from: `${location.pathname}${location.search}`,
          reason: session.reason,
        }}
      />
    );
  }
  return <Outlet />;
};

// Sign-in and account creation. A person who is already signed in goes home.
export const RedirectIfSignedIn = () => {
  const session = useSession();

  if (session.status === "loading") {
    return <SessionLoading />;
  }
  if (session.status === "signedIn") {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};
