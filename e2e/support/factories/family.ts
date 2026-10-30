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
  return (await api.request("POST", "/api/families", { name })) as Family;
}
