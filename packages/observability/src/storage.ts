// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { AsyncLocalStorage } from "node:async_hooks";

export const storage = new AsyncLocalStorage<{ readonly traceId: string }>();
