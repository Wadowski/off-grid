// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { BASE_IMAGE, DOCKER_CLI_IMAGE } from "./constants.js";

export const installHostDockerfile = (): string =>
  [
    `FROM ${DOCKER_CLI_IMAGE} AS cli`,
    `FROM ${BASE_IMAGE}`,
    "RUN apt-get update -qq && apt-get install -y -qq --no-install-recommends curl ca-certificates && rm -rf /var/lib/apt/lists/*",
    "COPY --from=cli /usr/local/bin/docker /opt/docker-real/docker",
    "COPY --from=cli /usr/local/libexec/docker/cli-plugins/docker-compose /usr/local/libexec/docker/cli-plugins/docker-compose",
    "",
  ].join("\n");
