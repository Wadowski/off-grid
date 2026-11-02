// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { registerIdentityRoutes } from "./http/register-identity-routes.js";

export const identityModule = {
  name: "identity",
  registerRoutes: registerIdentityRoutes,
};
