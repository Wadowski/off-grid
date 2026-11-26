// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileVersionCompletion } from "../../../../files/types.js";

export const toVersionAnnouncementTextId = (
  completed: FileVersionCompletion | null,
):
  | "files.versions.announceRestored"
  | "files.versions.announceDeleted"
  | "files.versions.announceDownloaded"
  | null => {
  if (completed === null) {
    return null;
  }
  switch (completed.kind) {
    case "restored":
      return "files.versions.announceRestored";
    case "deleted":
      return "files.versions.announceDeleted";
    case "downloaded":
      return "files.versions.announceDownloaded";
  }
};
