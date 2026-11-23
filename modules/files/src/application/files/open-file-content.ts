// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { toByteSize } from "../../domain/files/to-byte-size.js";
import { parseRangeHeader } from "../../domain/files/parse-range-header.js";
import type {
  FileContentDependencies,
  OpenContentOutcome,
  OpenContentRequest,
} from "../../types.js";
import { readAsUser } from "../read-as-user.js";
import { openStoredBytes } from "./open-stored-bytes.js";
import { resolveContentTarget } from "./resolve-content-target.js";

export const openFileContent = async (
  dependencies: FileContentDependencies,
  userId: string,
  request: OpenContentRequest,
): Promise<OpenContentOutcome> => {
  const target = await readAsUser(dependencies.db, userId, (tx) =>
    resolveContentTarget(tx, request.fileId, request.versionId),
  );
  if (target.outcome !== "found") {
    return target;
  }
  const { file } = target.value.target;
  const { version } = target.value;
  const sizeBytes = toByteSize(version.sizeBytes);
  const span = parseRangeHeader(request.rangeHeader, sizeBytes);
  if (span === "unsatisfiable") {
    return { outcome: "range-not-satisfiable", sizeBytes };
  }
  const stream = await openStoredBytes(dependencies.storage, version.storageKey, span);
  if (stream === null) {
    return { outcome: "not-found" };
  }
  return {
    outcome: "found",
    value: { fileName: file.name, mediaType: version.mimeType, sizeBytes, span, stream },
  };
};
