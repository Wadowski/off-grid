// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { saveBlobAsFile } from "../../../../downloads/save-blob-as-file.js";
import { RECOVERY_CODE_FILE_NAME } from "../../../../constants.js";

export const downloadRecoveryCodeFile = (
  recoveryCode: string,
  heading: string,
  explanation: string,
): void => {
  const content = [heading, "", recoveryCode, "", explanation, ""].join("\n");
  saveBlobAsFile(new Blob([content], { type: "text/plain" }), RECOVERY_CODE_FILE_NAME);
};
