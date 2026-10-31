// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { tokens } from "../src/tokens.js";

export type ColorName = keyof typeof tokens.color.light;

export type ColorPair = [foreground: ColorName, background: ColorName];
