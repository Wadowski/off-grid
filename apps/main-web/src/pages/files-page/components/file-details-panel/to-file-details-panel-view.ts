// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileDetailsState } from "../../../../files/types.js";
import type { FileDetailsPanelView } from "./types.js";

export const toFileDetailsPanelView = (details: FileDetailsState): FileDetailsPanelView => {
  if (details.status === "loading") {
    return { kind: "loading" };
  }
  if (details.status === "failed") {
    return {
      kind: "failed",
      errorTextId: details.errorTextId ?? "files.errors.failed",
      onRetry: details.refresh,
    };
  }
  if (details.file === null) {
    return { kind: "failed", errorTextId: "files.errors.failed", onRetry: details.refresh };
  }
  if (details.file.isFolder) {
    return { kind: "failed", errorTextId: "files.errors.isFolder", onRetry: details.refresh };
  }
  return { kind: "ready", file: details.file, breadcrumbs: details.breadcrumbs };
};
