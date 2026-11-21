// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { derivedDockerfile } from "./derived-dockerfile.js";

describe("derivedDockerfile", () => {
  it("sets the version label and environment on top of the stack image", () => {
    const text = derivedDockerfile("web", { version: "1.2.0", failsHealthCheck: false });

    expect(text).toContain("FROM offgrid-main-web:1.0.0");
    expect(text).toContain("LABEL org.opencontainers.image.version=1.2.0");
    expect(text).not.toContain("sed");
  });

  it("makes only the server health route fail for a release that fails its health check", () => {
    const failingServer = derivedDockerfile("server", { version: "1.9.0", failsHealthCheck: true });
    const failingWeb = derivedDockerfile("web", { version: "1.9.0", failsHealthCheck: true });

    expect(failingServer).toContain("src/http/register-get-health.ts");
    expect(failingServer).toContain("reply.code(500)");
    expect(failingWeb).not.toContain("sed");
  });
});
