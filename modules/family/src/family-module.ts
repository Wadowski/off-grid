// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileURLToPath } from "node:url";
import { registerFamilyRoutes } from "./http/register-family-routes.js";

export const familyModule = {
  name: "family",
  migrations: [
    {
      schema: "family" as const,
      directory: fileURLToPath(new URL("./infrastructure/migrations", import.meta.url)),
    },
  ],
  registerRoutes: registerFamilyRoutes,
};
