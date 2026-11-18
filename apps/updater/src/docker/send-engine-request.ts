// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { request } from "node:http";
import type { EngineResponse } from "../types.js";

export const sendEngineRequest = (
  socketPath: string,
  method: string,
  path: string,
  body?: unknown,
): Promise<EngineResponse> =>
  new Promise((resolve, reject) => {
    const payload = body === undefined ? undefined : JSON.stringify(body);
    const headers =
      payload === undefined
        ? {}
        : { "content-type": "application/json", "content-length": Buffer.byteLength(payload) };
    const engineRequest = request({ socketPath, method, path, headers }, (response) => {
      const chunks: Buffer[] = [];
      response.on("data", (chunk: Buffer) => chunks.push(chunk));
      response.on("error", reject);
      response.on("end", () =>
        resolve({
          status: response.statusCode ?? 0,
          text: Buffer.concat(chunks).toString("utf8"),
        }),
      );
    });
    engineRequest.on("error", reject);
    engineRequest.end(payload);
  });
