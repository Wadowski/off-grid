// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { HttpFetch } from "../types.js";
import { ReleaseSourceError } from "./errors/release-source-error.js";
import { isAllowedHttpsUrl } from "./is-allowed-https-url.js";
import { isRedirect } from "./is-redirect.js";
import { keepRedirectHeaders } from "./keep-redirect-headers.js";
import { requestInit } from "./request-init.js";

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
  const redirectUrl = location === null ? null : new URL(location, url).href;
  if (redirectUrl === null || !isAllowedHttpsUrl(redirectUrl, allowedHosts)) {
    throw new ReleaseSourceError("release source redirected to a host that is not allowed");
  }
  return httpFetch(redirectUrl, requestInit(keepRedirectHeaders(headers)));
};
