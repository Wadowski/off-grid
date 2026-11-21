// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { RELEASE_REPOSITORY_PATH } from "./constants.js";
import type { ReleaseRoute } from "./types.js";

const ROUTES: readonly {
  pattern: RegExp;
  build: (match: RegExpMatchArray) => ReleaseRoute;
}[] = [
  {
    pattern: new RegExp(`^/repos/${RELEASE_REPOSITORY_PATH}/releases/latest$`),
    build: () => ({ kind: "latest-release" }),
  },
  {
    pattern: new RegExp(`^/repos/${RELEASE_REPOSITORY_PATH}/releases/tags/v([0-9.]+)$`),
    build: (match) => ({ kind: "tagged-release", version: match[1] ?? "" }),
  },
  {
    pattern: new RegExp(`^/repos/${RELEASE_REPOSITORY_PATH}/releases/assets/([0-9]+)$`),
    build: (match) => ({ kind: "asset", assetId: Number(match[1]) }),
  },
  {
    pattern: new RegExp(`^/${RELEASE_REPOSITORY_PATH}/releases/latest/download/([A-Za-z0-9._-]+)$`),
    build: (match) => ({ kind: "latest-download", fileName: match[1] ?? "" }),
  },
  {
    pattern: new RegExp(
      `^/${RELEASE_REPOSITORY_PATH}/releases/download/v([0-9.]+)/([A-Za-z0-9._-]+)$`,
    ),
    build: (match) => ({
      kind: "versioned-download",
      version: match[1] ?? "",
      fileName: match[2] ?? "",
    }),
  },
];

export const matchReleaseRoute = (path: string): ReleaseRoute | null => {
  for (const { pattern, build } of ROUTES) {
    const match = path.match(pattern);
    if (match !== null) {
      return build(match);
    }
  }
  return null;
};
