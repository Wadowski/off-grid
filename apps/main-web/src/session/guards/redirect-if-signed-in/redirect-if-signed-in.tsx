// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { SessionLoading } from "../../components/session-loading/session-loading.js";
import { useSession } from "../../use-session.js";
import { returnPathOf } from "./return-path-of.js";

export const RedirectIfSignedIn = () => {
  const session = useSession();
  const location = useLocation();

  if (session.status === "loading") {
    return <SessionLoading />;
  }
  if (session.status === "signedIn") {
    return <Navigate to={returnPathOf(location.state)} replace />;
  }
  return <Outlet />;
};
