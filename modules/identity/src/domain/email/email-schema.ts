// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { EMAIL_MAX_LENGTH } from "../../constants.js";

export const emailSchema = z.email().max(EMAIL_MAX_LENGTH);
