// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { failMigration } from "./fail-migration.js";
import { migrateDatabase } from "./migrate-database.js";

await migrateDatabase().catch(failMigration);
