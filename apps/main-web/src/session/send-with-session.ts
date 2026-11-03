// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FAMILY_HEADER } from "../constants.js";
import { getAccessToken } from "./access-token.js";
import { endSessionLocally } from "./end-session.js";
import { renewSession } from "./renew-session.js";
import { getSessionState } from "./session-store.js";

// The fetch behind every request made as the signed-in person. A 401 means the
// access token has expired, so the session is renewed and the request sent once more.
export const sendWithSession = async (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  const sentToken = getAccessToken();
  const response = await send(input, init, sentToken);
  if (response.status !== 401 || sentToken === null) {
    return response;
  }
  try {
    await renewSession();
  } catch {
    endSessionLocally("sessionEnded");
    return response;
  }
  return send(input, init, getAccessToken());
};

const send = (
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  token: string | null,
): Promise<Response> =>
  fetch(input, { ...init, credentials: "include", headers: sessionHeaders(init?.headers, token) });

const sessionHeaders = (initHeaders: HeadersInit | undefined, token: string | null): Headers => {
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
