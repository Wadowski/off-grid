// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileURLToPath } from "node:url";

export const FIXTURES = fileURLToPath(new URL("./fixtures/migrations", import.meta.url));
