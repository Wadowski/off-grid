// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { SessionLoading } from "../../components/session-loading/session-loading.js";
import { useSession } from "../../use-session.js";

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
