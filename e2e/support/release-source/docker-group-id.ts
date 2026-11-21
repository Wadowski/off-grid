// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { statSync } from "node:fs";
import { DOCKER_SOCKET_PATH } from "./constants.js";

export const dockerGroupId = (): string =>
  process.env.OFFGRID_DOCKER_GID ?? String(statSync(DOCKER_SOCKET_PATH).gid);
