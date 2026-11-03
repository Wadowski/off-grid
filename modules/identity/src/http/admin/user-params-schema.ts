// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { userIdSchema } from "@offgrid/contracts";
import { z } from "zod";

export const userParamsSchema = z.object({ userId: userIdSchema });
