// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import {
  RELEASE_REDIRECT_STATUS_MAX,
  RELEASE_REDIRECT_STATUS_MIN,
  RELEASE_REQUEST_TIMEOUT_MILLISECONDS,
} from "../constants.js";
import type { HttpFetch } from "../types.js";
import { ReleaseSourceError } from "./errors/release-source-error.js";
import { isAllowedHttpsUrl } from "./is-allowed-https-url.js";

const isRedirect = (status: number): boolean =>
  status >= RELEASE_REDIRECT_STATUS_MIN && status <= RELEASE_REDIRECT_STATUS_MAX;

const requestInit = (headers: Record<string, string>): RequestInit => ({
  headers,
  redirect: "manual",
  signal: AbortSignal.timeout(RELEASE_REQUEST_TIMEOUT_MILLISECONDS),
});

export const fetchAllowingHosts = async (
  httpFetch: HttpFetch,
  url: string,
  headers: Record<string, string>,
  allowedHosts: readonly string[],
): Promise<Response> => {
  if (!isAllowedHttpsUrl(url, allowedHosts)) {
    throw new ReleaseSourceError("release source host is not allowed");
  }
  const response = await httpFetch(url, requestInit(headers));
  if (!isRedirect(response.status)) {
    return response;
  }
  const location = response.headers.get("location");
  if (location === null || !isAllowedHttpsUrl(new URL(location, url).href, allowedHosts)) {
    throw new ReleaseSourceError("release source redirected to a host that is not allowed");
  }
  return httpFetch(new URL(location, url).href, requestInit(headers));
};
