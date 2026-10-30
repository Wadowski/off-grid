// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileURLToPath } from "node:url";

export const OUTBOX_MIGRATIONS_DIRECTORY = fileURLToPath(new URL("../migrations", import.meta.url));
