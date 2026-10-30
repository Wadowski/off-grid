// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { TestDatabase as SharedTestDatabase } from "@offgrid/test-db";
import type { EventOf } from "../src/types.js";
import type { familyCreated } from "./family-created.js";

export type AppSchema = "outbox" | "family";

export type TestDatabase = SharedTestDatabase;

export type FamilyCreated = EventOf<typeof familyCreated>;
