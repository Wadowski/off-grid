// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type DriveSwitcherRowKind = "personal" | "family";

export type DriveSwitcherRowProps = {
  readonly name: string;
  readonly kind: DriveSwitcherRowKind;
  readonly to: string;
  readonly active: boolean;
};
