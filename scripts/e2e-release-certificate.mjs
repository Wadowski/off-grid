// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const CERTIFICATE_FILE_NAME = "ca.pem";
const KEY_FILE_NAME = "server.key";

const SUBJECT_ALTERNATIVE_NAMES = "DNS:host.docker.internal,DNS:localhost,IP:127.0.0.1";
const VALID_DAYS = "7";

export const ensureReleaseCertificate = (directory) => {
  const certificate = join(directory, CERTIFICATE_FILE_NAME);
  const key = join(directory, KEY_FILE_NAME);
  if (existsSync(certificate) && existsSync(key)) {
    return { certificate, key };
  }
  mkdirSync(directory, { recursive: true });
  execFileSync(
    "openssl",
    [
      "req",
      "-x509",
      "-newkey",
      "ec",
      "-pkeyopt",
      "ec_paramgen_curve:prime256v1",
      "-nodes",
      "-keyout",
      key,
      "-out",
      certificate,
      "-days",
      VALID_DAYS,
      "-subj",
      "/CN=offgrid-e2e-release-source",
      "-addext",
      `subjectAltName=${SUBJECT_ALTERNATIVE_NAMES}`,
      "-addext",
      "basicConstraints=critical,CA:TRUE",
    ],
    { stdio: "ignore" },
  );
  return { certificate, key };
};

if (import.meta.url === `file://${process.argv[1]}`) {
  ensureReleaseCertificate(process.argv[2]);
}
