// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";

export const registerUploadBodyParser = (scope: FastifyInstance): void => {
  scope.removeAllContentTypeParsers();
  scope.addContentTypeParser("*", (_request, payload, done) => {
    done(null, payload);
  });
};
