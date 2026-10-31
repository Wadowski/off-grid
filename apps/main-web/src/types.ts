// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type FamilySummary = {
  readonly id: string;
  readonly name: string;
};

export type ListStatus = "loading" | "ready" | "failed";

export type CreateFamilyStatus = "idle" | "submitting" | "waiting-for-list" | "done" | "failed";
