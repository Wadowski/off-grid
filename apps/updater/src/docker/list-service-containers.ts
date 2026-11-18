// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import type { DockerContext } from "../types.js";
import { containerSummarySchema } from "./engine-schemas.js";
import { requestEngineJson } from "./request-engine-json.js";

export const listServiceContainers = async (context: DockerContext, service: string) => {
  const filters = JSON.stringify({
    label: [
      `com.docker.compose.project=${context.project}`,
      `com.docker.compose.service=${service}`,
    ],
  });
  const body = await requestEngineJson(
    context.socketPath,
    "GET",
    `/containers/json?all=true&filters=${encodeURIComponent(filters)}`,
    { operation: "list containers" },
  );
  return z.array(containerSummarySchema).parse(body);
};
