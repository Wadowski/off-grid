// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { StorageIoError } from "../../../application/errors/storage-io-error.js";

const FILE_SYSTEM_CODE_PATTERN = /^E[A-Z]+$/;

export const toStorageIoError = (error: unknown): unknown => {
  const code =
    typeof error === "object" && error !== null && "code" in error ? error.code : undefined;
  return typeof code === "string" && FILE_SYSTEM_CODE_PATTERN.test(code)
    ? new StorageIoError(code)
    : error;
};
