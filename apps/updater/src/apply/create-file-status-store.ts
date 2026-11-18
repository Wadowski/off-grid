// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { StatusStore } from "../types.js";
import { writeUpdateStatus } from "./write-update-status.js";

export const createFileStatusStore = (statusFile: string): StatusStore => ({
  write: (status) => writeUpdateStatus(statusFile, status),
});
