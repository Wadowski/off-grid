// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { releaseManifestSchema } from "./release-manifest-schema.js";
import type { ReleaseManifest } from "./types.js";

const digest = (character: string): string => character.repeat(64);

const validManifest: ReleaseManifest = {
  schemaVersion: 1,
  version: "1.2.3",
  commit: "b".repeat(40),
  images: {
    server: {
      reference: `ghcr.io/wadowski/offgrid-main-server@sha256:${digest("a")}`,
      platforms: ["linux/amd64", "linux/arm64"],
    },
    web: {
      reference: `ghcr.io/wadowski/offgrid-main-web@sha256:${digest("c")}`,
      platforms: ["linux/amd64", "linux/arm64"],
    },
  },
  minimumPreviousVersion: "1.0.0",
};

const withChange = (change: Partial<ReleaseManifest>): unknown => ({ ...validManifest, ...change });

describe("releaseManifestSchema", () => {
  it("accepts a manifest that names both images by digest", () => {
    expect(releaseManifestSchema.parse(validManifest)).toEqual(validManifest);
  });

  it("rejects a version with a v prefix", () => {
    expect(() => releaseManifestSchema.parse(withChange({ version: "v1.2.3" }))).toThrow();
  });

  it("rejects a short commit sha", () => {
    expect(() => releaseManifestSchema.parse(withChange({ commit: "b".repeat(12) }))).toThrow();
  });

  it("rejects an image reference that uses a tag instead of a digest", () => {
    const manifest = withChange({
      images: {
        ...validManifest.images,
        server: {
          ...validManifest.images.server,
          reference: "ghcr.io/wadowski/offgrid-main-server:1.2.3",
        },
      },
    });
    expect(() => releaseManifestSchema.parse(manifest)).toThrow();
  });

  it("rejects an image reference from a registry other than ghcr.io", () => {
    const manifest = withChange({
      images: {
        ...validManifest.images,
        web: {
          ...validManifest.images.web,
          reference: `docker.io/wadowski/offgrid-main-web@sha256:${digest("c")}`,
        },
      },
    });
    expect(() => releaseManifestSchema.parse(manifest)).toThrow();
  });

  it("rejects a minimum previous version greater than the version", () => {
    expect(() =>
      releaseManifestSchema.parse(withChange({ minimumPreviousVersion: "1.3.0" })),
    ).toThrow();
  });

  it("rejects an unknown key", () => {
    expect(() => releaseManifestSchema.parse(withChange({ signature: "x" } as never))).toThrow();
  });
});
