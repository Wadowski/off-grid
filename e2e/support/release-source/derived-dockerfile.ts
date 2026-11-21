// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FAILING_HANDLER, HEALTH_ROUTE_FILE, HEALTHY_HANDLER, VERSION_LABEL } from "./constants.js";
import { stackImageName } from "./local-image-name.js";
import type { ReleaseService, ReleaseVersionPlan } from "./types.js";

const failingHealthStep = (service: ReleaseService, plan: ReleaseVersionPlan): string[] =>
  service === "server" && plan.failsHealthCheck
    ? [`RUN sed -i 's|${HEALTHY_HANDLER}|${FAILING_HANDLER}|' ${HEALTH_ROUTE_FILE}`]
    : [];

export const derivedDockerfile = (service: ReleaseService, plan: ReleaseVersionPlan): string =>
  [
    `FROM ${stackImageName(service)}`,
    `ENV OFFGRID_VERSION=${plan.version}`,
    `LABEL ${VERSION_LABEL}=${plan.version}`,
    ...failingHealthStep(service, plan),
    "",
  ].join("\n");
