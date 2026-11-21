// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const SCRIPT = fileURLToPath(new URL("e2e-release-certificate.mjs", import.meta.url));

const withDirectory = (run) => {
  const directory = mkdtempSync(join(tmpdir(), "release-certificate-"));
  try {
    run(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
};

test("creates a certificate that names the container host and a private key", () => {
  withDirectory((directory) => {
    execFileSync("node", [SCRIPT, directory]);

    const text = execFileSync(
      "openssl",
      ["x509", "-in", join(directory, "ca.pem"), "-noout", "-text"],
      {
        encoding: "utf8",
      },
    );
    assert.match(text, /DNS:host\.docker\.internal/);
    assert.match(text, /CA:TRUE/);
    assert.equal(statSync(join(directory, "server.key")).mode & 0o077, 0);
  });
});

test("keeps an existing certificate so a running stack keeps trusting it", () => {
  withDirectory((directory) => {
    execFileSync("node", [SCRIPT, directory]);
    const first = readFileSync(join(directory, "ca.pem"), "utf8");

    execFileSync("node", [SCRIPT, directory]);

    assert.equal(readFileSync(join(directory, "ca.pem"), "utf8"), first);
  });
});
