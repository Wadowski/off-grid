// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { NightlyTime } from "../types.js";

export const parseNightlyTime = (value: string): NightlyTime => {
  const [hour, minute] = value.split(":");
  return { hour: Number(hour), minute: Number(minute) };
};
