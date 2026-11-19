// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { chmod, mkdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { STATUS_DIRECTORY_MODE, STATUS_FILE_MODE } from "../constants.js";
import type { UpdateStatus } from "../types.js";
import { updateStatusSchema } from "@offgrid/contracts";

export const writeUpdateStatus = async (
  statusFile: string,
  status: UpdateStatus,
): Promise<void> => {
  const validStatus = updateStatusSchema.parse(status);
  const temporaryFile = `${statusFile}.${randomUUID()}.tmp`;
  await mkdir(dirname(statusFile), { recursive: true, mode: STATUS_DIRECTORY_MODE });
  try {
    await writeFile(temporaryFile, `${JSON.stringify(validStatus, null, 2)}\n`, {
      mode: STATUS_FILE_MODE,
      flag: "wx",
    });
    await chmod(temporaryFile, STATUS_FILE_MODE);
    await rename(temporaryFile, statusFile);
  } catch (error) {
    await rm(temporaryFile, { force: true }).catch(() => undefined);
    throw error;
  }
};
