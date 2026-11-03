// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { sessionRuntime } from "./session-runtime.js";
import type { SessionState } from "./types.js";

export const getSessionState = (): SessionState => sessionRuntime.current;
