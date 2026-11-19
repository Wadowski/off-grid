// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { UPDATE_ERROR_CODES } from "./constants.js";

export const systemUpdateErrorCodeSchema = z.enum(UPDATE_ERROR_CODES);
