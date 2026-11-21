// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { APIRequestContext } from "@playwright/test";
import { VERSION_PATH } from "./constants.js";

export const readRunningVersion = async (api: APIRequestContext): Promise<string> => {
  const response = await api.get(VERSION_PATH);
  return ((await response.json()) as { version: string }).version;
};
