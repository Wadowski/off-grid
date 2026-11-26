// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { waitForDrives } from "./factories/files.js";
import type { Session } from "./factories/instance-admin.js";
import type { ScenarioWorld } from "./fixtures.js";

export const familyDriveIdNamed = async (
  world: ScenarioWorld,
  session: Session,
  name: string,
): Promise<string> => {
  const drives = await waitForDrives(world.api, session, (listed) =>
    listed.some((drive) => drive.familyId !== null && drive.name === name),
  );
  const drive = drives.find((listed) => listed.familyId !== null && listed.name === name);
  if (drive === undefined) {
    throw new Error(`The family drive ${name} is not listed.`);
  }
  return drive.id;
};
