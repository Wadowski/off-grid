// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { driveParamsSchema, fileSchema } from "@offgrid/contracts";
import { sendNotFound, sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { uploadFile } from "../../application/files/upload-file.js";
import { resolveMimeType } from "../../domain/files/resolve-mime-type.js";
import type { FilesRouteContext } from "../../types.js";
import { registerUploadBodyParser } from "./register-upload-body-parser.js";
import { sendFilesConflict } from "./send-files-conflict.js";
import { sendPayloadTooLarge } from "./send-payload-too-large.js";
import { toFile } from "./to-file.js";
import { uploadHeadersSchema } from "./upload-headers-schema.js";

export const registerUploadFile = (api: FastifyInstance, context: FilesRouteContext): void => {
  api.register(async (scope) => {
    registerUploadBodyParser(scope);
    scope.post(
      "/drives/:id/files",
      withUser(context.currentUserId, async (request, reply, userId) => {
        const params = driveParamsSchema.safeParse(request.params);
        if (!params.success) {
          return sendValidationFailed(reply, params.error);
        }
        const headers = uploadHeadersSchema.safeParse(request.headers);
        if (!headers.success) {
          return sendValidationFailed(reply, headers.error);
        }
        if (
          headers.data.declaredLength !== null &&
          headers.data.declaredLength > context.maxUploadBytes
        ) {
          return sendPayloadTooLarge(reply);
        }
        const abortController = new AbortController();
        request.raw.once("close", () => abortController.abort());
        try {
          const outcome = await uploadFile(
            { db: context.db, storage: context.storage, maxUploadBytes: context.maxUploadBytes },
            userId,
            {
              driveId: params.data.id,
              parentId: headers.data.parentId,
              name: headers.data.name,
              mimeType: resolveMimeType(headers.data.declaredMimeType, headers.data.name),
              body: request.raw,
              signal: abortController.signal,
            },
          );
          if (outcome.outcome === "not-found") {
            return sendNotFound(reply);
          }
          return reply.code(201).send(fileSchema.parse(toFile(outcome.value)));
        } catch (error) {
          return sendFilesConflict(reply, error);
        }
      }),
    );
  });
};
