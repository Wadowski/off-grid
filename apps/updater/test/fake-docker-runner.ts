// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { DockerRunner, ImageReferences } from "../src/types.js";
import type { FakeDockerMethod } from "./types.js";

const recordCall = (
  calls: string[],
  failures: ReadonlyMap<FakeDockerMethod, Error>,
  method: FakeDockerMethod,
  entry: string,
): void => {
  calls.push(entry);
  const failure = failures.get(method);
  if (failure !== undefined) {
    throw failure;
  }
};

export const createFakeDockerRunner = (
  calls: string[],
  failures: ReadonlyMap<FakeDockerMethod, Error>,
  runningImages: ImageReferences,
): DockerRunner => ({
  inspectRunningImages: async () => {
    recordCall(calls, failures, "inspectRunningImages", "inspect");
    return runningImages;
  },
  pullImage: async (reference) => {
    recordCall(calls, failures, "pullImage", `pull:${reference}`);
  },
  runInitJob: async (serverImage) => {
    recordCall(calls, failures, "runInitJob", `migrate:${serverImage}`);
  },
  replaceContainers: async (images) => {
    recordCall(calls, failures, "replaceContainers", `replace:${images.server}|${images.web}`);
  },
  stopContainers: async () => {
    recordCall(calls, failures, "stopContainers", "stop");
  },
  startContainers: async (images) => {
    recordCall(calls, failures, "startContainers", `start:${images.server}|${images.web}`);
  },
});
