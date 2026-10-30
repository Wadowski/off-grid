// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { declarations } from "./declarations.js";
import { tokens } from "./tokens.js";

export const sharedDeclarations = [
  declarations("space", tokens.space),
  declarations("font-family", tokens.font.family),
  declarations("font-size", tokens.font.size),
  declarations("font-weight", tokens.font.weight),
  declarations("radius", tokens.radius),
  declarations("elevation", tokens.elevation),
  declarations("focus-ring", tokens.focusRing),
].join(" ");
