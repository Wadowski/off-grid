// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { DEFAULT_RELEASE_SOURCE_PORT } from "./constants.js";

export const releaseSourcePort = (): string =>
  process.env.E2E_RELEASE_SOURCE_PORT ?? DEFAULT_RELEASE_SOURCE_PORT;
