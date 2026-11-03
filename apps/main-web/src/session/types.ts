// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FamilySummary, SessionUser } from "../types.js";

export type SignedOutReason = "sessionEnded";

export type SessionState =
  | { readonly status: "loading" }
  | {
      readonly status: "signedOut";
      readonly freshServer: boolean;
      readonly reason: SignedOutReason | null;
    }
  | {
      readonly status: "signedIn";
      readonly user: SessionUser;
      readonly families: readonly FamilySummary[];
      readonly activeFamilyId: string | null;
    };

export type SessionMessage = { readonly type: "signed-in" } | { readonly type: "signed-out" };

export type AccessTokenState = {
  token: string | null;
  renewalTimer: ReturnType<typeof setTimeout> | undefined;
};

export type SessionStore = {
  current: SessionState;
  readonly listeners: Set<() => void>;
};

export type SessionChannelState = { channel: BroadcastChannel | null };

export type RenewState = { inFlight: Promise<void> | null };

export type StartState = { started: Promise<void> | null };
