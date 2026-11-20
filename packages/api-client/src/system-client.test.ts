// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it, vi } from "vitest";
import { createApiClient, createSystemClient } from "./index.js";

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

const systemWith = (response: Response) => {
  const transport = vi.fn<typeof fetch>().mockResolvedValue(response);
  const client = createApiClient({ baseUrl: "http://localhost:3000/api", fetch: transport });
  return { system: createSystemClient(client), transport };
};

describe("createSystemClient", () => {
  it("requests the running version anonymously and returns it parsed", async () => {
    const { system, transport } = systemWith(jsonResponse({ version: "1.2.3", commit: "abc1234" }));

    await expect(system.version()).resolves.toEqual({ version: "1.2.3", commit: "abc1234" });
    expect(transport).toHaveBeenCalledWith(
      "http://localhost:3000/api/system/version",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("rejects a response that carries fields beyond the version schema", async () => {
    const { system } = systemWith(jsonResponse({ version: "1.2.3", hostname: "box" }));

    await expect(system.version()).rejects.toThrow();
  });

  it("reads the update status with GET and returns it parsed", async () => {
    const status = updateStatusFixture();
    const { system, transport } = systemWith(jsonResponse(status));

    await expect(system.update()).resolves.toEqual(status);
    expect(transport).toHaveBeenCalledWith(
      "http://localhost:3000/api/system/update",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("rejects an update status that carries unknown fields", async () => {
    const { system } = systemWith(jsonResponse({ ...updateStatusFixture(), hostname: "box" }));

    await expect(system.update()).rejects.toThrow();
  });

  it("posts an update check and returns the checked versions", async () => {
    const check = {
      currentVersion: "1.2.3",
      latestVersion: "1.3.0",
      updateAvailable: true,
      updateAllowed: true,
      checkedAt: "2026-11-20T10:00:00.000Z",
    };
    const { system, transport } = systemWith(jsonResponse(check));

    await expect(system.checkForUpdate()).resolves.toEqual(check);
    expect(transport).toHaveBeenCalledWith(
      "http://localhost:3000/api/system/update/check",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("posts the apply request and returns the started target version", async () => {
    const { system, transport } = systemWith(
      jsonResponse({ started: true, targetVersion: "1.3.0" }, 202),
    );

    await expect(system.applyUpdate()).resolves.toEqual({ started: true, targetVersion: "1.3.0" });
    expect(transport).toHaveBeenCalledWith(
      "http://localhost:3000/api/system/update/apply",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("puts the nightly flag and returns the saved value", async () => {
    const { system, transport } = systemWith(jsonResponse({ enabled: true }));

    await expect(system.setNightlyUpdate(true)).resolves.toEqual({ enabled: true });
    expect(transport).toHaveBeenCalledWith(
      "http://localhost:3000/api/system/update/nightly",
      expect.objectContaining({ method: "PUT", body: JSON.stringify({ enabled: true }) }),
    );
  });

  it("rejects a nightly response that is not a boolean flag", async () => {
    const { system } = systemWith(jsonResponse({ enabled: "yes" }));

    await expect(system.setNightlyUpdate(true)).rejects.toThrow();
  });
});

const updateStatusFixture = () => ({
  currentVersion: "1.2.3",
  latestVersion: "1.3.0",
  updateAvailable: true,
  updateAllowed: true,
  checkedAt: "2026-11-20T10:00:00.000Z",
  runState: "idle",
  lastRun: null,
  running: false,
  nightlyEnabled: false,
});
