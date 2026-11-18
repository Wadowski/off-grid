// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ContainerSummary, DockerContext } from "../types.js";
import { isReplacedName } from "./is-replaced-name.js";
import { listServiceContainers } from "./list-service-containers.js";

export const findCurrentContainer = async (
  context: DockerContext,
  service: string,
): Promise<ContainerSummary | null> => {
  const containers = await listServiceContainers(context, service);
  return (
    containers.find((container) => !container.Names.some((name) => isReplacedName(name))) ?? null
  );
};
