// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { accessTokenState } from "./access-token-state.js";

export const getAccessToken = (): string | null => accessTokenState.token;
