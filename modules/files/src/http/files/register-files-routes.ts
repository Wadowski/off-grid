// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import type { FilesRouteContext } from "../../types.js";
import { registerCreateFolder } from "./register-create-folder.js";
import { registerDownloadFile } from "./register-download-file.js";
import { registerDownloadFileVersion } from "./register-download-file-version.js";
import { registerGetFile } from "./register-get-file.js";
import { registerMoveFile } from "./register-move-file.js";
import { registerRenameFile } from "./register-rename-file.js";
import { registerUploadFile } from "./register-upload-file.js";
import { registerUploadFileVersion } from "./register-upload-file-version.js";
import { registerListFileVersions } from "./register-list-file-versions.js";
import { registerRestoreFileVersion } from "./register-restore-file-version.js";
import { registerDeleteFileVersion } from "./register-delete-file-version.js";
import { registerListDriveChildren } from "./register-list-drive-children.js";
import { registerListDrives } from "./register-list-drives.js";
import { registerListFileChildren } from "./register-list-file-children.js";
import { registerTrashRoutes } from "../trash/register-trash-routes.js";

export const registerFilesRoutes = (api: FastifyInstance, context: FilesRouteContext): void => {
  registerListDrives(api, context);
  registerListDriveChildren(api, context);
  registerGetFile(api, context);
  registerDownloadFile(api, context);
  registerDownloadFileVersion(api, context);
  registerListFileChildren(api, context);
  registerCreateFolder(api, context);
  registerRenameFile(api, context);
  registerMoveFile(api, context);
  registerUploadFile(api, context);
  registerListFileVersions(api, context);
  registerUploadFileVersion(api, context);
  registerRestoreFileVersion(api, context);
  registerDeleteFileVersion(api, context);
  registerTrashRoutes(api, context);
};
