// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { DEFAULT_REGISTRY_PORT } from "./constants.js";

export const registryPort = (): string => process.env.E2E_REGISTRY_PORT ?? DEFAULT_REGISTRY_PORT;
