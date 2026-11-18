// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { releaseManifestSchema } from "@offgrid/contracts";
import type { ReleaseManifest } from "../types.js";
import { ReleaseSourceError } from "./errors/release-source-error.js";

export const parseReleaseManifest = (manifestText: string): ReleaseManifest => {
  let manifestJson: unknown;
  try {
    manifestJson = JSON.parse(manifestText);
  } catch {
    throw new ReleaseSourceError("release manifest is not JSON");
  }
  const parsed = releaseManifestSchema.safeParse(manifestJson);
  if (!parsed.success) {
    throw new ReleaseSourceError("release manifest does not match the schema");
  }
  return parsed.data;
};
