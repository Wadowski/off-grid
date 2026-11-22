// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyReply } from "fastify";
import type { ContentHeaders, OpenedContent } from "../../types.js";

export const sendFileContent = (
  reply: FastifyReply,
  content: OpenedContent,
  headers: ContentHeaders,
) =>
  reply
    .code(content.span === null ? 200 : 206)
    .headers(headers)
    .send(content.stream);
