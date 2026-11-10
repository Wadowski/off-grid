// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import { MAIL_RETRY_DELAYS_MS } from "./constants.js";
import { sendMailWithSmtp } from "./infrastructure/mail/send-mail-with-smtp.js";
import { registerIdentityRoutes } from "./http/register-identity-routes.js";
import type {
  EmailChannelDependencies,
  IdentityModuleOptions,
  IdentityRouteInput,
} from "./types.js";

export const createIdentityModule = (options: IdentityModuleOptions) => ({
  name: "identity",
  registerRoutes: (api: FastifyInstance, context: IdentityRouteInput): void => {
    const emailDependencies: EmailChannelDependencies = {
      db: context.db,
      encryptionKey: options.mailEncryptionKey,
      logger: context.logger,
      sendMail: sendMailWithSmtp,
      retryDelaysMs: MAIL_RETRY_DELAYS_MS,
    };
    registerIdentityRoutes(api, {
      ...context,
      mailEncryptionKey: options.mailEncryptionKey,
      emailDependencies,
    });
  },
});
