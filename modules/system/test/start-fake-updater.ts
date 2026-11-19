// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import { TEST_UPDATER_TOKEN } from "./constants.js";
import type { FakeUpdater, FakeUpdaterReply, UpdaterCall } from "./types.js";

const readBody = async (request: IncomingMessage): Promise<unknown> => {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.from(chunk));
  }
  return chunks.length === 0 ? undefined : JSON.parse(Buffer.concat(chunks).toString("utf8"));
};

const answer = (response: ServerResponse, reply: FakeUpdaterReply): void => {
  response.writeHead(reply.status, { "content-type": "application/json" });
  response.end(JSON.stringify(reply.body));
};

export const startFakeUpdater = async (): Promise<FakeUpdater> => {
  const calls: UpdaterCall[] = [];
  const replies = new Map<string, FakeUpdaterReply>();
  const server = createServer(async (request, response) => {
    const method = request.method ?? "";
    const path = request.url ?? "";
    calls.push({
      method,
      path,
      authorization: request.headers.authorization ?? null,
      body: await readBody(request),
    });
    answer(
      response,
      replies.get(`${method} ${path}`) ?? { status: 500, body: { error: "unexpected" } },
    );
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  return {
    settings: { url: `http://127.0.0.1:${port}`, token: TEST_UPDATER_TOKEN },
    calls,
    respond: (method, path, reply) => {
      replies.set(`${method} ${path}`, reply);
    },
    stop: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  };
};
