// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDescriptor } from "./types.js";
import { familyModule } from "@offgrid/family";
import { identityModule } from "@offgrid/identity";

export const BEARER_PATTERN = /^Bearer (.+)$/;
export const RATE_WINDOW_MS = 60_000;

export const CORS_ALLOWED_METHODS = ["GET", "POST", "PATCH", "OPTIONS"];

export const FAMILY_HEADER = "x-offgrid-family-id";

export const CORS_ALLOWED_HEADERS = [
  "accept",
  "content-type",
  "x-offgrid-dev-user-id",
  FAMILY_HEADER,
  "x-trace-id",
];

export const CORS_EXPOSED_HEADERS = ["x-trace-id"];

export const UNMATCHED_ROUTE = "unmatched";

export const MAX_MESSAGE_LENGTH = 500;

export const INTERNAL_MESSAGE = "Internal server error";

export const GENERIC_REJECTION_MESSAGE = "Request rejected";

export const MODULES: readonly ModuleDescriptor[] = [familyModule, identityModule];

export const MODULE_NAME_PATTERN = /^[a-z][a-z0-9]*$/;

export const CONNECTION_TIMEOUT_MS = 5000;

export const FORBIDDEN_FAMILY_MESSAGE = "You are not a member of this family";

export const INVALID_FAMILY_MESSAGE = "The family header must be a family id";

export const RECOVERY_USAGE = [
  "Usage:",
  "  recover-admin reset-password --email <email>",
  "  recover-admin create-admin --email <email> --name <display name>",
].join("\n");
