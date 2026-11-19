// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import type { Client, Pool } from "pg";
import type { UpdaterSettings } from "../src/types.js";

export interface SystemTestDatabase {
  readonly admin: Client;
  readonly pool: Pool;
  readonly db: ModuleDatabase;
  reset(): Promise<void>;
  stop(): Promise<void>;
}

export interface UpdaterCall {
  readonly method: string;
  readonly path: string;
  readonly authorization: string | null;
  readonly body: unknown;
}

export interface FakeUpdaterReply {
  readonly status: number;
  readonly body: unknown;
}

export interface FakeUpdater {
  readonly settings: UpdaterSettings;
  readonly calls: UpdaterCall[];
  respond(method: string, path: string, reply: FakeUpdaterReply): void;
  stop(): Promise<void>;
}

export interface SystemTestAppOptions {
  readonly updater: UpdaterSettings | null;
  readonly adminUserIds: readonly string[];
}
