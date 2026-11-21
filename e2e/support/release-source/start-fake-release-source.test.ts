// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { get } from "node:https";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readReleaseRequestLog } from "./read-release-request-log.js";
import { startFakeReleaseSource } from "./start-fake-release-source.js";
import type { FakeReleaseSource, ReleaseTestReply } from "./types.js";

const CERTIFICATE_SCRIPT = fileURLToPath(
  new URL("../../../scripts/e2e-release-certificate.mjs", import.meta.url),
);

const writeRelease = (directory: string, version: string): void => {
  const folder = join(directory, "releases", version);
  mkdirSync(folder, { recursive: true });
  writeFileSync(join(folder, "release-manifest.json"), `{"version":"${version}"}`);
  writeFileSync(join(folder, "SHA256SUMS"), `sums ${version}`);
};

describe("startFakeReleaseSource", () => {
  let directory = "";
  let source: FakeReleaseSource | undefined;

  const request = (path: string): Promise<ReleaseTestReply> =>
    new Promise((resolve, reject) => {
      get({ host: "127.0.0.1", port: source?.port, path, ca: certificateText() }, (response) => {
        const chunks: Buffer[] = [];
        response.on("data", (chunk: Buffer) => chunks.push(chunk));
        response.on("end", () =>
          resolve({
            status: response.statusCode ?? 0,
            text: Buffer.concat(chunks).toString("utf8"),
          }),
        );
      }).on("error", reject);
    });

  const certificateText = (): string => readFileSync(join(directory, "ca.pem"), "utf8");

  beforeEach(async () => {
    directory = mkdtempSync(join(tmpdir(), "fake-release-source-"));
    execFileSync("node", [CERTIFICATE_SCRIPT, directory]);
    writeRelease(directory, "1.1.0");
    writeRelease(directory, "1.2.0");
    writeFileSync(join(directory, "latest-version"), "1.2.0\n");
    source = await startFakeReleaseSource({
      directory,
      certificate: join(directory, "ca.pem"),
      key: join(directory, "server.key"),
      port: 0,
    });
  });

  afterEach(async () => {
    await source?.close();
    rmSync(directory, { recursive: true, force: true });
  });

  it("answers the latest release with the latest version and its manifest asset", async () => {
    const reply = await request("/repos/offgrid-e2e/offgrid/releases/latest");

    expect(reply.status).toBe(200);
    expect(JSON.parse(reply.text)).toEqual({
      tag_name: "v1.2.0",
      assets: [{ id: 20, name: "release-manifest.json" }],
    });
  });

  it("answers a tagged release and serves its manifest through the asset id", async () => {
    const release = await request("/repos/offgrid-e2e/offgrid/releases/tags/v1.1.0");
    const assetId = (JSON.parse(release.text) as { assets: { id: number }[] }).assets[0]?.id;
    const asset = await request(`/repos/offgrid-e2e/offgrid/releases/assets/${assetId}`);

    expect(asset.text).toBe('{"version":"1.1.0"}');
  });

  it("follows a change of the latest version written to the folder", async () => {
    writeFileSync(join(directory, "latest-version"), "1.1.0");

    const reply = await request("/offgrid-e2e/offgrid/releases/latest/download/SHA256SUMS");

    expect(reply.text).toBe("sums 1.1.0");
  });

  it("serves a file of a pinned version for the install script", async () => {
    const reply = await request("/offgrid-e2e/offgrid/releases/download/v1.2.0/SHA256SUMS");

    expect(reply).toEqual({ status: 200, text: "sums 1.2.0" });
  });

  it("refuses every other path and file name", async () => {
    const unknownPath = await request("/anything/else");
    const unknownFile = await request("/offgrid-e2e/offgrid/releases/latest/download/secret.txt");
    const unknownVersion = await request("/repos/offgrid-e2e/offgrid/releases/tags/v9.9.9");

    expect([unknownPath.status, unknownFile.status, unknownVersion.status]).toEqual([
      404, 404, 404,
    ]);
  });

  it("logs every request with its host and status", async () => {
    await request("/repos/offgrid-e2e/offgrid/releases/latest");
    await request("/anything/else");

    const log = await readReleaseRequestLog(directory);

    expect(log.map((entry) => [entry.path, entry.status])).toEqual([
      ["/repos/offgrid-e2e/offgrid/releases/latest", 200],
      ["/anything/else", 404],
    ]);
    expect(log.every((entry) => entry.host === `127.0.0.1:${source?.port}`)).toBe(true);
  });
});
