// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

const twoDigits = (value: number): string => String(value).padStart(2, "0");

export const formatMinutesOfDay = (minutesOfDay: number): string =>
  `${twoDigits(Math.floor(minutesOfDay / 60))}:${twoDigits(minutesOfDay % 60)}`;
