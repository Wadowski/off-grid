// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { hash } from "@node-rs/argon2";
import { ARGON2_MEMORY_COST_KIB, ARGON2_PARALLELISM, ARGON2_TIME_COST } from "../../constants.js";

export const hashPassword = (password: string): Promise<string> =>
  hash(password, {
    memoryCost: ARGON2_MEMORY_COST_KIB,
    timeCost: ARGON2_TIME_COST,
    parallelism: ARGON2_PARALLELISM,
  });
