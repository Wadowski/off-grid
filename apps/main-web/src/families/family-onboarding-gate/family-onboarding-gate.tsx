// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Navigate, Outlet, useLocation, useOutletContext } from "react-router-dom";
import { FIRST_FAMILY_PATH } from "../../constants.js";
import type { FamiliesContext } from "../../types.js";

export const FamilyOnboardingGate = () => {
  const context = useOutletContext<FamiliesContext>();
  const { pathname } = useLocation();
  const isOnFirstFamilyPath = pathname === FIRST_FAMILY_PATH;
  const hasFamily = context.families.length > 0;
  const isReady = context.listStatus === "ready";

  if (isReady && !hasFamily && !isOnFirstFamilyPath) {
    return <Navigate to={FIRST_FAMILY_PATH} replace />;
  }
  if (isReady && hasFamily && isOnFirstFamilyPath) {
    return <Navigate to="/" replace />;
  }
  return <Outlet context={context} />;
};
