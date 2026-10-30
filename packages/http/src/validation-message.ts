// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { z } from "zod";

const MAX_MESSAGE_LENGTH = 500;

export const validationMessage = (error: z.ZodError): string =>
  error.issues
    .map((issue) => `${issue.path.join(".") || "request"}: ${issue.message}`)
    .join("; ")
    .slice(0, MAX_MESSAGE_LENGTH);
