// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Navigate, Outlet } from "react-router-dom";
import { SessionLoading } from "../../components/session-loading/session-loading.js";
import { useSession } from "../../use-session.js";

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
