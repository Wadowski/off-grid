// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import type { FilesRouteContext } from "../../types.js";
import { registerEmptyDriveTrash } from "./register-empty-drive-trash.js";
import { registerListDriveTrash } from "./register-list-drive-trash.js";
import { registerPurgeFile } from "./register-purge-file.js";
import { registerRestoreFile } from "./register-restore-file.js";
import { registerTrashFile } from "./register-trash-file.js";

export const registerTrashRoutes = (api: FastifyInstance, context: FilesRouteContext): void => {
  registerTrashFile(api, context);
  registerRestoreFile(api, context);
  registerPurgeFile(api, context);
  registerListDriveTrash(api, context);
  registerEmptyDriveTrash(api, context);
};
