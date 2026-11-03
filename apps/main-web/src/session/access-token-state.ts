// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { AccessTokenState } from "./types.js";

export const accessTokenState: AccessTokenState = { token: null, renewalTimer: undefined };
