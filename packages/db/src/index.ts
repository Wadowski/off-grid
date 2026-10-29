// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export { MIGRATOR_ROLE, appRoleOf, isDatabaseSchema, ownerRoleOf } from "./schemas.js";
export { DATABASE_SCHEMAS } from "./schema-names.js";
export { withFamilyContext, withUserContext } from "./context.js";
export { createModuleDb, moduleConnectionString } from "./module-db.js";
export {
  MigrationChecksumError,
  MigrationFailedError,
  loadMigrations,
  runMigrations,
} from "./migrate.js";
export { assertOwnershipScopes, scopeViolation } from "./scopes.js";
export { OWNERSHIP_SCOPES } from "./scope-names.js";
export type {
  DatabaseSchema,
  DatabaseTarget,
  Migration,
  MigrationSource,
  OwnershipScope,
  SettingExecutor,
} from "./types.js";
export { provisionLoginRole } from "./provision.js";
export { quoteIdent } from "./sql.js";
