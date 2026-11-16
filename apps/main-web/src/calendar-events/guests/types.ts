// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type GuestCandidate = {
  readonly userId: string;
  readonly name: string | undefined;
  readonly familyId: string;
  readonly familyName: string;
};

export type GuestCandidateGroup = {
  readonly familyName: string;
  readonly candidates: readonly GuestCandidate[];
};

export type LoadStatus = "loading" | "ready" | "failed";

export type EventGuestRow = {
  readonly userId: string;
  readonly invitedAt: string;
};

export type EventGuestsState = {
  readonly status: LoadStatus;
  readonly guests: readonly EventGuestRow[];
  readonly retry: () => void;
};

export type GuestCandidatesState = {
  readonly status: LoadStatus;
  readonly candidates: readonly GuestCandidate[];
  readonly retry: () => void;
};
