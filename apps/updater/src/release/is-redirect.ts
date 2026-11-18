// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { RELEASE_REDIRECT_STATUS_MAX, RELEASE_REDIRECT_STATUS_MIN } from "../constants.js";

export const isRedirect = (status: number): boolean =>
  status >= RELEASE_REDIRECT_STATUS_MIN && status <= RELEASE_REDIRECT_STATUS_MAX;
