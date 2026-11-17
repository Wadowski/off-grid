// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type FileDateLabel =
  | { readonly kind: "today"; readonly time: string }
  | { readonly kind: "yesterday" }
  | { readonly kind: "date"; readonly text: string };

export type CalendarDay = {
  readonly year: number;
  readonly month: number;
  readonly day: number;
};
