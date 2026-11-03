// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { RECOVERY_CODE_FILE_NAME } from "../../../../constants.js";

export const downloadRecoveryCodeFile = (
  recoveryCode: string,
  heading: string,
  explanation: string,
): void => {
  const content = [heading, "", recoveryCode, "", explanation, ""].join("\n");
  const url = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = RECOVERY_CODE_FILE_NAME;
  link.click();
  URL.revokeObjectURL(url);
};
