// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FAKE_IMAGE_OWNER, IMAGE_NAMES } from "./constants.js";
import { runDocker } from "./run-docker.js";
import type { ReleaseService } from "./types.js";

export const pushImage = async (
  service: ReleaseService,
  localName: string,
  version: string,
  registryPort: string,
): Promise<string> => {
  const repository = `127.0.0.1:${registryPort}/${FAKE_IMAGE_OWNER}/${IMAGE_NAMES[service]}`;
  await runDocker(["tag", localName, `${repository}:${version}`]);
  await runDocker(["push", "--quiet", `${repository}:${version}`]);
  const digests = JSON.parse(
    await runDocker(["image", "inspect", "--format", "{{json .RepoDigests}}", localName]),
  ) as string[];
  const digest = digests.find((candidate) => candidate.startsWith(`${repository}@`));
  if (digest === undefined) {
    throw new Error(`no registry digest for ${localName} after the push`);
  }
  return digest.slice(digest.indexOf("@") + 1);
};
