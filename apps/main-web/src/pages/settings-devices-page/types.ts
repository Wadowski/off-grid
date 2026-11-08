// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type DeviceSession = {
  readonly id: string;
  readonly deviceLabel: string | null;
  readonly lastUsedAt: string;
  readonly current: boolean;
};

export type DeviceListStatus = "loading" | "ready" | "failed";
