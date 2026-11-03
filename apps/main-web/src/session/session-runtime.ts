// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { SessionRuntime } from "./types.js";

export const sessionRuntime: SessionRuntime = {
  current: { status: "loading" },
  listeners: new Set(),
  accessToken: null,
  renewalTimer: undefined,
  channel: null,
  renewInFlight: null,
  started: null,
};
