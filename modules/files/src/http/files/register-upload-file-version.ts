// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileParamsSchema, fileSchema } from "@offgrid/contracts";
import { sendNotFound, sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { uploadFileVersion } from "../../application/files/upload-file-version.js";
import type { FilesRouteContext } from "../../types.js";
import { registerUploadBodyParser } from "./register-upload-body-parser.js";
import { sendFilesConflict } from "./send-files-conflict.js";
import { sendIsFolder } from "./send-is-folder.js";
import { sendPayloadTooLarge } from "./send-payload-too-large.js";
import { toFile } from "./to-file.js";
import { uploadVersionHeadersSchema } from "./upload-version-headers-schema.js";

export const registerUploadFileVersion = (
  api: FastifyInstance,
  context: FilesRouteContext,
): void => {
  api.register(async (scope) => {
    registerUploadBodyParser(scope);
    scope.post(
      "/files/:id/versions",
      withUser(context.currentUserId, async (request, reply, userId) => {
        const params = fileParamsSchema.safeParse(request.params);
        if (!params.success) {
          return sendValidationFailed(reply, params.error);
        }
        const headers = uploadVersionHeadersSchema.safeParse(request.headers);
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
        request.raw.once("close", () => {
          if (!request.raw.complete) {
            abortController.abort();
          }
        });
        try {
          const outcome = await uploadFileVersion(
            { db: context.db, storage: context.storage, maxUploadBytes: context.maxUploadBytes },
            userId,
            {
              fileId: params.data.id,
              declaredMimeType: headers.data.declaredMimeType,
              body: request.raw,
              signal: abortController.signal,
            },
          );
          if (outcome.outcome === "not-found") {
            return sendNotFound(reply);
          }
          if (outcome.outcome === "folder") {
            return sendIsFolder(reply);
          }
          return reply.code(201).send(fileSchema.parse(toFile(outcome.value)));
        } catch (error) {
          return sendFilesConflict(reply, error);
        }
      }),
    );
  });
};
