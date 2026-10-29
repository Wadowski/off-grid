// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export {
  DATABASE_SCHEMAS,
  MIGRATOR_ROLE,
  appRoleOf,
  isDatabaseSchema,
  ownerRoleOf,
  type DatabaseSchema,
} from "./schemas.js";
export { withFamilyContext, withUserContext, type SettingExecutor } from "./context.js";
export { createModuleDb, moduleConnectionString, type DatabaseTarget } from "./module-db.js";
export {
  MigrationChecksumError,
  MigrationFailedError,
  loadMigrations,
  runMigrations,
  type Migration,
  type MigrationSource,
} from "./migrate.js";
export {
  OWNERSHIP_SCOPES,
  assertOwnershipScopes,
  scopeViolation,
  type OwnershipScope,
} from "./scopes.js";
export { provisionLoginRole } from "./provision.js";
export { quoteIdent } from "./sql.js";
