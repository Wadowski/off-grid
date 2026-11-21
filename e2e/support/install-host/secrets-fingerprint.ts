// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { runDocker } from "../release-source/run-docker.js";
import { SECRETS_READER_IMAGE, SECRETS_VOLUME_SUFFIX } from "./constants.js";

export const secretsFingerprint = (project: string): Promise<string> =>
  runDocker([
    "run",
    "--rm",
    "--volume",
    `${project}_${SECRETS_VOLUME_SUFFIX}:/secrets:ro`,
    SECRETS_READER_IMAGE,
    "sh",
    "-c",
    "cd /secrets && sha256sum *",
  ]);
