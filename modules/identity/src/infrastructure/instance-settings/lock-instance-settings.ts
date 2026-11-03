// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { INSTANCE_SETTINGS_KEY } from "../../constants.js";

export const lockInstanceSettings = async (tx: ModuleTransaction): Promise<void> => {
  await tx.$queryRaw`SELECT setting_key FROM identity.instance_settings WHERE setting_key = ${INSTANCE_SETTINGS_KEY} FOR UPDATE`;
};
