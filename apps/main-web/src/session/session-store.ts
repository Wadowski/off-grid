// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { SessionStore } from "./types.js";

export const sessionStore: SessionStore = { current: { status: "loading" }, listeners: new Set() };
