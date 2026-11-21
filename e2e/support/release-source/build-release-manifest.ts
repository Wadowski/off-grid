// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import {
  FAKE_COMMIT,
  FAKE_IMAGE_OWNER,
  IMAGE_NAMES,
  MANIFEST_IMAGE_HOST,
  MINIMUM_PREVIOUS_VERSION,
} from "./constants.js";
import type { PushedImages } from "./types.js";

const manifestReference = (name: string, digest: string): string =>
  `${MANIFEST_IMAGE_HOST}/${FAKE_IMAGE_OWNER}/${name}@${digest}`;

export const buildReleaseManifest = (version: string, digests: PushedImages): string =>
  JSON.stringify(
    {
      schemaVersion: 1,
      version,
      commit: FAKE_COMMIT,
      images: {
        server: {
          reference: manifestReference(IMAGE_NAMES.server, digests.server),
          platforms: ["linux/amd64"],
        },
        web: {
          reference: manifestReference(IMAGE_NAMES.web, digests.web),
          platforms: ["linux/amd64"],
        },
      },
      minimumPreviousVersion: MINIMUM_PREVIOUS_VERSION,
    },
    null,
    2,
  );
