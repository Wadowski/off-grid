// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type RunningVersionState =
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly version: string }
  | { readonly status: "failed" };
