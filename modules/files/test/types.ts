// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import type { Client } from "pg";
import type { FileStorage } from "../src/types.js";

export interface StorageFixture {
  readonly storage: FileStorage;
  cleanup(): Promise<void>;
}

export type StorageFixtureFactory = () => Promise<StorageFixture>;

export interface FilesTestDatabase {
  readonly admin: Client;
  readonly db: ModuleDatabase;
  reset(): Promise<void>;
  stop(): Promise<void>;
}

export type SeedScope = "user" | "family";
