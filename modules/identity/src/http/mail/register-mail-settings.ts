// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import type { IdentityRouteContext } from "../../types.js";
import { registerGetMailSettings } from "./register-get-mail-settings.js";
import { registerSaveMailSettings } from "./register-save-mail-settings.js";
import { registerSendTestMail } from "./register-send-test-mail.js";

export const registerMailSettings = (api: FastifyInstance, context: IdentityRouteContext): void => {
  registerGetMailSettings(api, context);
  registerSaveMailSettings(api, context);
  registerSendTestMail(api, context);
};
