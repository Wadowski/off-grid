// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { DriveSwitcherRowKind } from "./types.js";

export const DRIVE_KIND_GLYPHS: Readonly<Record<DriveSwitcherRowKind, string>> = {
  personal: "lock",
  family: "folder_shared",
};

export const ACTIVE_DRIVE_GLYPH = "check_circle";
