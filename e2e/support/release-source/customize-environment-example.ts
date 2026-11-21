// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { dockerGroupId } from "./docker-group-id.js";
import {
  FAKE_IMAGE_OWNER,
  FAKE_RELEASE_REPOSITORY,
  INSTALL_SERVER_PORT,
  INSTALL_WEB_PORT,
} from "./constants.js";

export const customizeEnvironmentExample = (example: string): string => {
  const values: Record<string, string> = {
    OFFGRID_IMAGE_OWNER: FAKE_IMAGE_OWNER,
    OFFGRID_RELEASE_REPOSITORY: FAKE_RELEASE_REPOSITORY,
    OFFGRID_WEB_PORT: INSTALL_WEB_PORT,
    OFFGRID_SERVER_PORT: INSTALL_SERVER_PORT,
    OFFGRID_CORS_ORIGINS: `http://127.0.0.1:${INSTALL_WEB_PORT}`,
    OFFGRID_DOCKER_GID: dockerGroupId(),
  };
  return example
    .split("\n")
    .map((line) => {
      const name = line.split("=")[0] ?? "";
      return name in values ? `${name}=${values[name]}` : line;
    })
    .join("\n");
};
