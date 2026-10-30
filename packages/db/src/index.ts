// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export { MIGRATOR_ROLE } from "./constants.js";
export { appRoleOf } from "./app-role-of.js";
export { isDatabaseSchema } from "./is-database-schema.js";
export { ownerRoleOf } from "./owner-role-of.js";
export { DATABASE_SCHEMAS } from "./constants.js";
export { withFamilyContext } from "./with-family-context.js";
export { withUserContext } from "./with-user-context.js";
export { createModuleDb } from "./create-module-db.js";
export { moduleConnectionString } from "./module-connection-string.js";
export { MigrationChecksumError } from "./migration-checksum-error.js";
export { MigrationFailedError } from "./migration-failed-error.js";
export { loadMigrations } from "./load-migrations.js";
export { runMigrations } from "./run-migrations.js";
export { assertOwnershipScopes } from "./assert-ownership-scopes.js";
export { scopeViolation } from "./scope-violation.js";
export { OWNERSHIP_SCOPES } from "./constants.js";
export type {
  DatabaseSchema,
  DatabaseTarget,
  Migration,
  MigrationSource,
  OwnershipScope,
  SettingExecutor,
} from "./types.js";
export { provisionLoginRole } from "./provision-login-role.js";
export { quoteIdent } from "./quote-ident.js";
