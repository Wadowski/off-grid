// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { driveParamsSchema } from "./drive-params-schema.js";
import { fileParamsSchema } from "./file-params-schema.js";
import { fileVersionParamsSchema } from "./file-version-params-schema.js";
import { filesRoutes } from "./files-routes.js";
import { uploadParamsSchema } from "./upload-params-schema.js";

const placeholdersOf = (path: string): string[] =>
  path
    .split("/")
    .filter((segment) => segment.startsWith(":"))
    .map((segment) => segment.slice(1));

describe("filesRoutes", () => {
  it("lists every files route with its path", () => {
    expect(filesRoutes).toEqual({
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
      fileVersionContent: "/files/:id/versions/:versionId/content",
      fileVersionRestore: "/files/:id/versions/:versionId/restore",
      uploads: "/uploads",
      upload: "/uploads/:id",
    });
  });

  it("names the path parameters that each params schema validates", () => {
    expect(placeholdersOf(filesRoutes.driveChildren)).toEqual(Object.keys(driveParamsSchema.shape));
    expect(placeholdersOf(filesRoutes.file)).toEqual(Object.keys(fileParamsSchema.shape));
    expect(placeholdersOf(filesRoutes.upload)).toEqual(Object.keys(uploadParamsSchema.shape));
    expect(placeholdersOf(filesRoutes.fileVersionRestore)).toEqual(
      Object.keys(fileVersionParamsSchema.shape),
    );
  });
});
