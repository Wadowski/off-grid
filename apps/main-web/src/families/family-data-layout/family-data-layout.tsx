// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Outlet } from "react-router-dom";
import { useFamilies } from "../use-families.js";

export const FamilyDataLayout = () => {
  const familiesState = useFamilies();

  return <Outlet context={familiesState} />;
};
