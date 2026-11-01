// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { registerFamilyRoutes } from "./http/register-family-routes.js";

export const familyModule = {
  name: "family",
  registerRoutes: registerFamilyRoutes,
};
