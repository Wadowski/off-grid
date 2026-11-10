// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarModule } from "@offgrid/calendar";
import { createNotificationsModule } from "@offgrid/notifications";
import { familyModule } from "@offgrid/family";
import { createIdentityModule } from "@offgrid/identity";
import type { ModuleDescriptor, ServerConfig } from "../types.js";

export const modulesFor = (config: ServerConfig): readonly ModuleDescriptor[] => [
  familyModule,
  calendarModule,
  createIdentityModule({ mailEncryptionKey: config.mail.encryptionKey }),
  createNotificationsModule(),
];
