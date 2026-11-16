// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ISOLATED_DATABASE_NAME_PATTERN } from "./constants.js";

export const assertIsolatedDatabaseName = (name: string): void => {
  if (!ISOLATED_DATABASE_NAME_PATTERN.test(name)) {
    throw new Error("Refusing to use a database name that is not an isolated test database name");
  }
};
