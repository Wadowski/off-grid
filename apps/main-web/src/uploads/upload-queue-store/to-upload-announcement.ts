// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type {
  UploadAnnouncement,
  UploadAnnouncementTextId,
  UploadErrorTextId,
  UploadItem,
} from "../types.js";

export const toUploadAnnouncement = (
  previous: UploadAnnouncement | null,
  textId: UploadAnnouncementTextId,
  item: UploadItem,
  reasonTextId: UploadErrorTextId | null,
): UploadAnnouncement => ({
  sequence: (previous?.sequence ?? 0) + 1,
  textId,
  name: item.name,
  reasonTextId,
});
