// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const isSessionEndedState = (routeState: unknown): boolean =>
  typeof routeState === "object" &&
  routeState !== null &&
  "reason" in routeState &&
  routeState.reason === "sessionEnded";
