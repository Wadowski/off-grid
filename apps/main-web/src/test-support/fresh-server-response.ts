// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FakeResponse } from "./types.js";

export const freshServerResponse = (): FakeResponse => ({
  status: 200,
  body: { freshServer: true, registrationOpen: true },
});
