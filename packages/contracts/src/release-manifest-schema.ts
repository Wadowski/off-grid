// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { compareReleaseVersions } from "./compare-release-versions.js";
import {
  GIT_COMMIT_PATTERN,
  RELEASE_PLATFORMS,
  RELEASE_VERSION_PATTERN,
  SERVER_IMAGE_REFERENCE_PATTERN,
  WEB_IMAGE_REFERENCE_PATTERN,
} from "./constants.js";

const releasePlatformSchema = z.enum(RELEASE_PLATFORMS);

export const releaseManifestSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    version: z.string().regex(RELEASE_VERSION_PATTERN),
    commit: z.string().regex(GIT_COMMIT_PATTERN),
    images: z.strictObject({
      server: z.strictObject({
        reference: z.string().regex(SERVER_IMAGE_REFERENCE_PATTERN),
        platforms: z.array(releasePlatformSchema).min(1),
      }),
      web: z.strictObject({
        reference: z.string().regex(WEB_IMAGE_REFERENCE_PATTERN),
        platforms: z.array(releasePlatformSchema).min(1),
      }),
    }),
    minimumPreviousVersion: z.string().regex(RELEASE_VERSION_PATTERN),
  })
  .refine(
    (manifest) => compareReleaseVersions(manifest.minimumPreviousVersion, manifest.version) <= 0,
    {
      message: "minimumPreviousVersion must not be greater than version",
      path: ["minimumPreviousVersion"],
    },
  );
