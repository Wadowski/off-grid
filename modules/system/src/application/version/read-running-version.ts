// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { systemVersionSchema } from "@offgrid/contracts";
import type { SystemVersionOptions } from "../../types.js";

export const readRunningVersion = (options: SystemVersionOptions) =>
  systemVersionSchema.parse(
    options.commit === undefined
      ? { version: options.version }
      : { version: options.version, commit: options.commit },
  );
