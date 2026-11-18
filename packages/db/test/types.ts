// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Client, Pool } from "pg";
import type { DatabaseTarget } from "../src/index.js";

export interface Context {
  familyId?: string;
  userId?: string;
}

export interface TestDatabase {
  admin: Client;
  migrator: Client;
  migratorTarget: DatabaseTarget;
  target: DatabaseTarget;
  connectClient(): Promise<Client>;
  connectPool(): Pool;
  stop(): Promise<void>;
}

export interface FileInput {
  driveId: string;
  owner: Context;
  name: string;
  parentId?: string | null;
  isFolder?: boolean;
  mimeType?: string | null;
  sizeBytes?: number | null;
  currentVersionId?: string | null;
}
