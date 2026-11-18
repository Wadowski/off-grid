// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ContainerInspect } from "../types.js";
import { composeEnvironment } from "./compose-environment.js";

export const buildCreateBody = (
  source: ContainerInspect,
  image: string,
  imageEnv: readonly string[],
): Record<string, unknown> => ({
  ...source.Config,
  Hostname: undefined,
  Image: image,
  Env: composeEnvironment(source.Config.Env ?? [], imageEnv),
  HostConfig: source.HostConfig,
  NetworkingConfig: {
    EndpointsConfig: Object.fromEntries(
      Object.keys(source.NetworkSettings.Networks ?? {}).map((network) => [network, {}]),
    ),
  },
});
