// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { AnyEventDefinition } from "./types.js";

export const parseEvent = <D extends AnyEventDefinition>(
  definition: D,
  input: unknown,
): ReturnType<D["envelope"]["parse"]> =>
  definition.envelope.parse(input) as ReturnType<D["envelope"]["parse"]>;
