// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { ApiClient } from "../api.js";

export type Family = { id: string; name: string };

export type CreateFamilyInput = { name?: string };

function uniqueName(prefix: string): string {
  return `${prefix} ${randomUUID().slice(0, 8)}`;
}

export async function createFamily(
  api: ApiClient,
  { name = uniqueName("Family") }: CreateFamilyInput = {},
): Promise<Family> {
  return parseFamily(await api.request("POST", "/api/families", { name }));
}

function parseFamily(value: unknown): Family {
  if (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "name" in value &&
    typeof value.name === "string"
  ) {
    return { id: value.id, name: value.name };
  }
  throw new Error("Response is not a family with a string id and name.");
}
