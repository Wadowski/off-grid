// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { storage } from "./storage.js";

export const currentTraceId = (): string | undefined => {
  return storage.getStore()?.traceId;
};
