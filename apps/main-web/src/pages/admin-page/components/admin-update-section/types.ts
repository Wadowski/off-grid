// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { components } from "@offgrid/api-client";

export type SystemUpdate = components["schemas"]["SystemUpdate"];

export type UpdateRun = NonNullable<SystemUpdate["lastRun"]>;

export type UpdateStep = UpdateRun["steps"][number];

export type UpdateStepName = UpdateStep["name"];

export type UpdateStatusState =
  | { readonly status: "loading" }
  | { readonly status: "failed" }
  | { readonly status: "ready"; readonly update: SystemUpdate; readonly unreachable: boolean };

export type UpdateErrorTextId =
  | "admin.update.errors.noUpdateAvailable"
  | "admin.update.errors.updateNotAllowed"
  | "admin.update.errors.alreadyRunning"
  | "admin.update.errors.updaterUnavailable"
  | "admin.update.errors.releaseSourceUnreachable"
  | "admin.update.errors.currentVersionUnknown"
  | "admin.update.errors.generic";
