// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ContainerInspect } from "../types.js";
import { containerCreatedSchema } from "./engine-schemas.js";
import { buildCreateBody } from "./build-create-body.js";
import { inspectImage } from "./inspect-image.js";
import { requestEngineJson } from "./request-engine-json.js";

export const createContainerFrom = async (
  socketPath: string,
  source: ContainerInspect,
  image: string,
  name: string,
): Promise<string> => {
  const imageEnv = (await inspectImage(socketPath, source.Image)).Config.Env ?? [];
  const created = containerCreatedSchema.parse(
    await requestEngineJson(
      socketPath,
      "POST",
      `/containers/create?name=${encodeURIComponent(name)}`,
      {
        operation: "create container",
        body: buildCreateBody(source, image, imageEnv),
      },
    ),
  );
  return created.Id;
};
