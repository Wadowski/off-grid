// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDescriptor } from "./types.js";
import { familyModule } from "@offgrid/family";

export const RATE_WINDOW_MS = 60_000;

export const UNMATCHED_ROUTE = "unmatched";

export const MAX_MESSAGE_LENGTH = 500;

export const INTERNAL_MESSAGE = "Internal server error";

export const GENERIC_REJECTION_MESSAGE = "Request rejected";

export const MODULES: readonly ModuleDescriptor[] = [familyModule];

export const MODULE_NAME_PATTERN = /^[a-z][a-z0-9]*$/;

export const USER_HEADER = "x-offgrid-user-id";

export const FAMILY_HEADER = "x-offgrid-family-id";

export const ACCESS_GROUPS_HEADER = "x-offgrid-access-group-ids";

export const CONNECTION_TIMEOUT_MS = 5000;
