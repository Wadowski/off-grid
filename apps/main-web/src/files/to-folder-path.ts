// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const toFolderPath = (driveId: string, folderId?: string): string => {
  const drivePath = `/files/${encodeURIComponent(driveId)}/folder`;
  return folderId === undefined ? drivePath : `${drivePath}/${encodeURIComponent(folderId)}`;
};
