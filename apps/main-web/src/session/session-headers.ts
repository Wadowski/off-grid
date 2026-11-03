// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FAMILY_HEADER } from "../constants.js";
import { getSessionState } from "./get-session-state.js";

export const sessionHeaders = (
  initHeaders: HeadersInit | undefined,
  token: string | null,
): Headers => {
  const headers = new Headers(initHeaders);
  if (token !== null) {
    headers.set("authorization", `Bearer ${token}`);
  }
  const state = getSessionState();
  if (state.status === "signedIn" && state.activeFamilyId !== null) {
    headers.set(FAMILY_HEADER, state.activeFamilyId);
  }
  return headers;
};
