// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { localImageName, stackImageName } from "./local-image-name.js";
import { runDocker } from "./run-docker.js";

export const retagUpdaterImage = async (version: string): Promise<string> => {
  const name = localImageName("updater", version);
  await runDocker(["tag", stackImageName("updater"), name]);
  return name;
};
