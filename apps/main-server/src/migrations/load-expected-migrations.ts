// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { loadMigrations, PRISMA_MIGRATIONS_DIRECTORY } from "@offgrid/db";

export const loadExpectedMigrations = () => loadMigrations(PRISMA_MIGRATIONS_DIRECTORY);
