// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { DockerRunner, ImageReferences } from "../src/types.js";
import type { FakeDockerMethod } from "./types.js";

const recordCall = (
  calls: string[],
  failingMethods: ReadonlySet<FakeDockerMethod>,
  method: FakeDockerMethod,
  entry: string,
): void => {
  calls.push(entry);
  if (failingMethods.has(method)) {
    throw new Error(`${method} failed`);
  }
};

export const createFakeDockerRunner = (
  calls: string[],
  failingMethods: ReadonlySet<FakeDockerMethod>,
  runningImages: ImageReferences,
): DockerRunner => ({
  inspectRunningImages: async () => {
    recordCall(calls, failingMethods, "inspectRunningImages", "inspect");
    return runningImages;
  },
  pullImage: async (reference) => {
    recordCall(calls, failingMethods, "pullImage", `pull:${reference}`);
  },
  runInitJob: async (serverImage) => {
    recordCall(calls, failingMethods, "runInitJob", `migrate:${serverImage}`);
  },
  replaceContainers: async (images) => {
    recordCall(
      calls,
      failingMethods,
      "replaceContainers",
      `replace:${images.server}|${images.web}`,
    );
  },
  stopContainers: async () => {
    recordCall(calls, failingMethods, "stopContainers", "stop");
  },
  startContainers: async (images) => {
    recordCall(calls, failingMethods, "startContainers", `start:${images.server}|${images.web}`);
  },
});
