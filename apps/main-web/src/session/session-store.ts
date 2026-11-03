// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useSyncExternalStore } from "react";
import type { FamilySummary, SessionUser } from "../types.js";

// Why the person is signed out. "sessionEnded" means a renewal was refused,
// for example because the session was ended on another device.
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

let state: SessionState = { status: "loading" };
const listeners = new Set<() => void>();

export const getSessionState = (): SessionState => state;

export const setSessionState = (next: SessionState): void => {
  state = next;
  for (const listener of listeners) {
    listener();
  }
};

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const useSession = (): SessionState => useSyncExternalStore(subscribe, getSessionState);

export const resetSessionState = (): void => {
  state = { status: "loading" };
};
