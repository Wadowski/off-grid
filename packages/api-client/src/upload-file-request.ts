// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileSchema, filesRoutes, FILE_NAME_HEADER, PARENT_ID_HEADER } from "@offgrid/contracts";
import { fillRoute } from "./fill-route.js";
import type { ApiClient, UploadFileInput } from "./types.js";

export const uploadFileRequest = async (
  client: ApiClient,
  driveId: string,
  input: UploadFileInput,
) =>
  fileSchema.parse(
    await client.uploadBytes(
      fillRoute(filesRoutes.driveFiles, { id: driveId }),
      input.file,
      {
        [FILE_NAME_HEADER]: encodeURIComponent(input.file.name),
        ...(input.parentId === undefined ? {} : { [PARENT_ID_HEADER]: input.parentId }),
        ...(input.file.type === "" ? {} : { "content-type": input.file.type }),
      },
      { onProgress: input.onProgress, signal: input.signal },
    ),
  );
