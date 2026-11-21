// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readFileSync } from "node:fs";
import { createServer } from "node:https";
import type { AddressInfo } from "node:net";
import { buildReleaseResponse } from "./build-release-response.js";
import { logReleaseRequest } from "./log-release-request.js";
import type { FakeReleaseSource, FakeReleaseSourceOptions } from "./types.js";

export const startFakeReleaseSource = async (
  options: FakeReleaseSourceOptions,
): Promise<FakeReleaseSource> => {
  const server = createServer(
    { cert: readFileSync(options.certificate), key: readFileSync(options.key) },
    async (request, response) => {
      const path = new URL(request.url ?? "/", "https://fake.invalid").pathname;
      const result = await buildReleaseResponse(options.directory, path).catch(() => ({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "fake release source failed" }),
      }));
      await logReleaseRequest(options.directory, {
        method: request.method ?? "GET",
        path,
        host: request.headers.host ?? "",
        status: result.status,
      });
      response.writeHead(result.status, { "content-type": result.contentType });
      response.end(result.body);
    },
  );
  await new Promise<void>((resolve) => server.listen(options.port, "0.0.0.0", resolve));
  const { port } = server.address() as AddressInfo;
  return {
    port,
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
};
