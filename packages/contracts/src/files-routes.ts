// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const filesRoutes = {
  drives: "/drives",
  driveChildren: "/drives/:id/children",
  driveFolders: "/drives/:id/folders",
  driveFiles: "/drives/:id/files",
  driveTrash: "/drives/:id/trash",
  file: "/files/:id",
  fileChildren: "/files/:id/children",
  fileMove: "/files/:id/move",
  fileContent: "/files/:id/content",
  fileTrash: "/files/:id/trash",
  fileRestore: "/files/:id/restore",
  fileVersions: "/files/:id/versions",
  fileVersion: "/files/:id/versions/:versionId",
  fileVersionContent: "/files/:id/versions/:versionId/content",
  fileVersionRestore: "/files/:id/versions/:versionId/restore",
  uploadLimit: "/files/upload-limit",
  uploads: "/uploads",
  upload: "/uploads/:id",
} as const;
