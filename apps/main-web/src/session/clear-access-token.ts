// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { sessionRuntime } from "./session-runtime.js";

export const clearAccessToken = (): void => {
  sessionRuntime.accessToken = null;
  clearTimeout(sessionRuntime.renewalTimer);
  sessionRuntime.renewalTimer = undefined;
};
