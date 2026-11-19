// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import type { FilesRouteContext } from "../../types.js";
import { registerCreateFolder } from "./register-create-folder.js";
import { registerGetFile } from "./register-get-file.js";
import { registerMoveFile } from "./register-move-file.js";
import { registerRenameFile } from "./register-rename-file.js";
import { registerListDriveChildren } from "./register-list-drive-children.js";
import { registerListDrives } from "./register-list-drives.js";
import { registerListFileChildren } from "./register-list-file-children.js";

export const registerFilesRoutes = (api: FastifyInstance, context: FilesRouteContext): void => {
  registerListDrives(api, context);
  registerListDriveChildren(api, context);
  registerGetFile(api, context);
  registerListFileChildren(api, context);
  registerCreateFolder(api, context);
  registerRenameFile(api, context);
  registerMoveFile(api, context);
};
