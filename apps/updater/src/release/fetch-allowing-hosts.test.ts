// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import type { HttpFetch } from "../types.js";
import { ReleaseSourceError } from "./errors/release-source-error.js";
import { fetchAllowingHosts } from "./fetch-allowing-hosts.js";

const API_URL = "https://api.github.com/repos/owner/offgrid/releases/latest";
const DOWNLOAD_URL = "https://release-assets.githubusercontent.com/asset/7";
const ALLOWED_HOSTS = ["api.github.com", "release-assets.githubusercontent.com"];
const HEADERS = {
  accept: "application/octet-stream",
  authorization: "Bearer secret-token",
  "user-agent": "offgrid-updater",
};

const redirectTo = (location: string): Response =>
  new Response(null, { status: 302, headers: { location } });

const recordingFetch = (responses: readonly Response[]) => {
  const calls: { url: string; headers: Record<string, string> }[] = [];
  const httpFetch: HttpFetch = async (url, init) => {
    calls.push({ url, headers: init.headers as Record<string, string> });
    const response = responses[calls.length - 1];
    if (response === undefined) {
      throw new Error(`unexpected request to ${url}`);
    }
    return response;
  };
  return { httpFetch, calls };
};

describe("fetchAllowingHosts", () => {
  it("returns a response that is not a redirect without following anything", async () => {
    const { httpFetch, calls } = recordingFetch([new Response("ok", { status: 200 })]);

    const response = await fetchAllowingHosts(httpFetch, API_URL, HEADERS, ALLOWED_HOSTS);

    expect(response.status).toBe(200);
    expect(calls).toHaveLength(1);
  });

  it("refuses a first request to a host that is not allowed", async () => {
    const { httpFetch, calls } = recordingFetch([]);

    await expect(
      fetchAllowingHosts(httpFetch, "https://evil.example/x", HEADERS, ALLOWED_HOSTS),
    ).rejects.toThrow(ReleaseSourceError);
    expect(calls).toHaveLength(0);
  });

  it("follows an allowed redirect with only accept and user-agent, never authorization", async () => {
    const { httpFetch, calls } = recordingFetch([
      redirectTo(DOWNLOAD_URL),
      new Response("manifest", { status: 200 }),
    ]);

    await fetchAllowingHosts(httpFetch, API_URL, HEADERS, ALLOWED_HOSTS);

    expect(calls[0]?.headers).toEqual(HEADERS);
    expect(calls[1]).toEqual({
      url: DOWNLOAD_URL,
      headers: { accept: "application/octet-stream", "user-agent": "offgrid-updater" },
    });
  });

  it("drops the authorization header whatever its letter case on the redirect", async () => {
    const { httpFetch, calls } = recordingFetch([
      redirectTo(DOWNLOAD_URL),
      new Response("manifest", { status: 200 }),
    ]);

    await fetchAllowingHosts(
      httpFetch,
      API_URL,
      { Authorization: "Bearer secret-token", Accept: "application/json" },
      ALLOWED_HOSTS,
    );

    expect(calls[1]?.headers).toEqual({ Accept: "application/json" });
  });

  it("refuses a redirect to a host that is not allowed and does not follow it", async () => {
    const { httpFetch, calls } = recordingFetch([redirectTo("https://evil.example/steal")]);

    await expect(fetchAllowingHosts(httpFetch, API_URL, HEADERS, ALLOWED_HOSTS)).rejects.toThrow(
      ReleaseSourceError,
    );
    expect(calls).toHaveLength(1);
  });

  it("refuses a redirect without a location header", async () => {
    const { httpFetch, calls } = recordingFetch([new Response(null, { status: 302 })]);

    await expect(fetchAllowingHosts(httpFetch, API_URL, HEADERS, ALLOWED_HOSTS)).rejects.toThrow(
      ReleaseSourceError,
    );
    expect(calls).toHaveLength(1);
  });
});
