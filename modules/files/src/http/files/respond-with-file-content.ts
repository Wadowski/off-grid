// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { sendNotFound } from "@offgrid/http";
import type { FastifyReply } from "fastify";
import { openFileContent } from "../../application/files/open-file-content.js";
import type { ContentDisposition, FilesRouteContext, OpenContentRequest } from "../../types.js";
import { toContentHeaders } from "../../domain/files/to-content-headers.js";
import { sendContentIsFolder } from "./send-content-is-folder.js";
import { sendFileContent } from "./send-file-content.js";
import { sendRangeNotSatisfiable } from "./send-range-not-satisfiable.js";

export const respondWithFileContent = async (
  reply: FastifyReply,
  context: FilesRouteContext,
  userId: string,
  request: OpenContentRequest,
  requestedDisposition: ContentDisposition,
) => {
  const outcome = await openFileContent(
    { db: context.db, storage: context.storage },
    userId,
    request,
  );
  if (outcome.outcome === "not-found") {
    return sendNotFound(reply);
  }
  if (outcome.outcome === "folder") {
    return sendContentIsFolder(reply);
  }
  if (outcome.outcome === "range-not-satisfiable") {
    return sendRangeNotSatisfiable(reply, outcome.sizeBytes);
  }
  const headers = toContentHeaders({
    fileName: outcome.value.fileName,
    mediaType: outcome.value.mediaType,
    requestedDisposition,
    sizeBytes: outcome.value.sizeBytes,
    span: outcome.value.span,
  });
  return sendFileContent(reply, outcome.value, headers);
};
