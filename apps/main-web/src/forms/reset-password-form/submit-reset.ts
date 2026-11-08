// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { anonymousAuthClient } from "../../api/anonymous-api-client.js";
import type { RecoveryMethod } from "../../recovery/types.js";

export const submitReset = (
  method: RecoveryMethod,
  email: string,
  code: string,
  password: string,
) =>
  method === "recoveryCode"
    ? anonymousAuthClient.recoverWithRecoveryCode({ email, recoveryCode: code, password })
    : anonymousAuthClient.resetPassword({ email, code, password });
