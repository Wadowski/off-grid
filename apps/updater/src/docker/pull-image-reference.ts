// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { DockerApiError } from "./errors/docker-api-error.js";
import { sendEngineRequest } from "./send-engine-request.js";

const DIGEST_SEPARATOR = "@";

export const pullImageReference = async (socketPath: string, reference: string): Promise<void> => {
  const [repository, digest] = reference.split(DIGEST_SEPARATOR);
  const response = await sendEngineRequest(
    socketPath,
    "POST",
    `/images/create?fromImage=${encodeURIComponent(repository ?? "")}&tag=${encodeURIComponent(digest ?? "")}`,
  );
  if (response.status !== 200 || response.text.includes('"errorDetail"')) {
    throw new DockerApiError("pull image", response.status);
  }
};
