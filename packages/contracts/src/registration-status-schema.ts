// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";

export const registrationStatusSchema = z.object({
  freshServer: z.boolean(),
  registrationOpen: z.boolean(),
});
