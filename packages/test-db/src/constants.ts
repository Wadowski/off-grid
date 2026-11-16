// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const INIT_SCRIPTS = [
  "../../../infra/init/sql/01-roles-and-schemas.sql",
  "../../../infra/init/sql/02-scope-helpers.sql",
];

export const CONTAINER_IMAGE = "postgres:17-alpine";

export const POOL_MAX = 4;

export const MIGRATOR_ROLE_NAME = "offgrid_migrator";

export const APP_ROLE_NAME = "offgrid_app";

export const SHARED_DATABASE_FILE_ENV = "OFFGRID_TEST_DATABASE_FILE";

export const SHARED_CLUSTER_SERVER_SETTINGS = [
  "max_connections=300",
  "fsync=off",
  "synchronous_commit=off",
  "full_page_writes=off",
] as const;

export const TEST_DATABASE_LABEL = "org.offgrid.test-db";

export const SHARED_CLUSTER_LABEL_VALUE = "shared-cluster";

export const ISOLATED_DATABASE_PREFIX = "offgrid_test_";

export const ISOLATED_DATABASE_NAME_PATTERN = /^offgrid_test_[0-9a-f]{24}$/;

export const CONNECTION_FILE_NAME = "connection.json";

export const FORWARDED_SIGNALS = [
  "SIGINT",
  "SIGTERM",
  "SIGHUP",
] as const satisfies readonly NodeJS.Signals[];
