// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { FakeEngine, FakeEngineOptions, FakeEngineRequest } from "./types.js";

interface Container {
  readonly id: string;
  name: string;
  image: string;
  config: Record<string, unknown>;
  env: string[];
  labels: Record<string, string>;
  running: boolean;
  exitCode: number;
}

interface Image {
  readonly id: string;
  readonly reference: string;
  readonly repoDigests: string[];
  readonly env: string[];
}

interface Reply {
  readonly status: number;
  readonly json?: unknown;
  readonly text?: string;
}

const readBody = (request: IncomingMessage): Promise<string> =>
  new Promise((resolve) => {
    const chunks: Buffer[] = [];
    request.on("data", (chunk: Buffer) => chunks.push(chunk));
    request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });

const notFound = (): Reply => ({ status: 404, json: { message: "no such object" } });

const summaryOf = (container: Container) => ({
  Id: container.id,
  Names: [`/${container.name}`],
  Image: container.image,
});

const labelsMatch = (container: Container, filters: { label?: string[] }): boolean =>
  (filters.label ?? []).every((entry) => {
    const [key, value] = entry.split("=");
    return container.labels[key ?? ""] === value;
  });

const findContainer = (containers: Container[], reference: string): Container | undefined =>
  containers.find((container) => container.id === reference || container.name === reference);

const inspectOf = (container: Container, images: Image[]) => ({
  Id: container.id,
  Name: `/${container.name}`,
  Image: images.find((image) => image.reference === container.config.Image)?.id ?? "",
  Config: { ...container.config, Env: container.env, Labels: container.labels },
  HostConfig: { PortBindings: {} },
  NetworkSettings: { Networks: { offgrid_default: {} } },
});

export const startFakeDockerEngine = async (options: FakeEngineOptions): Promise<FakeEngine> => {
  const directory = mkdtempSync(join(tmpdir(), "offgrid-engine-"));
  const socketPath = join(directory, "engine.sock");
  const requests: FakeEngineRequest[] = [];
  const images: Image[] = options.images.map((image) => ({
    id: image.id,
    reference: image.reference,
    repoDigests: [...image.repoDigests],
    env: [...image.env],
  }));
  const containers: Container[] = options.containers.map((container) => ({
    id: `id-${container.name}`,
    name: container.name,
    image: images.find((image) => image.reference === container.image)?.id ?? "",
    config: { Image: container.image, Cmd: ["node", "--import", "tsx", "src/migrate.ts"] },
    env: [...container.env],
    labels: {
      "com.docker.compose.project": "offgrid",
      "com.docker.compose.service": container.service,
    },
    running: container.running,
    exitCode: container.exitCode,
  }));

  const handle = (method: string, url: URL, body: string): Reply => {
    const path = url.pathname;
    if (method === "GET" && path === "/containers/json") {
      const filters = JSON.parse(url.searchParams.get("filters") ?? "{}") as { label?: string[] };
      return {
        status: 200,
        json: containers.filter((c) => labelsMatch(c, filters)).map(summaryOf),
      };
    }
    if (method === "POST" && path === "/images/create") {
      const reference = `${url.searchParams.get("fromImage")}@${url.searchParams.get("tag")}`;
      if (options.pullFails === true) {
        return { status: 200, text: '{"errorDetail":{"message":"denied: secret text"}}\n' };
      }
      if (!images.some((image) => image.reference === reference)) {
        images.push({
          id: `sha256:pulled-${images.length}`,
          reference,
          repoDigests: [reference],
          env: ["NODE_ENV=production", "OFFGRID_VERSION=2.0.0"],
        });
      }
      return { status: 200, text: '{"status":"Downloaded"}\n' };
    }
    if (method === "GET" && path.startsWith("/images/")) {
      const id = decodeURIComponent(path.slice("/images/".length).replace(/\/json$/, ""));
      const image = images.find((candidate) => candidate.id === id);
      return image === undefined
        ? notFound()
        : {
            status: 200,
            json: { Id: image.id, RepoDigests: image.repoDigests, Config: { Env: image.env } },
          };
    }
    if (method === "POST" && path === "/containers/create") {
      const name = url.searchParams.get("name") ?? "";
      const payload = JSON.parse(body) as Record<string, unknown>;
      const config = { ...payload };
      const env = config.Env;
      delete config.Env;
      delete config.HostConfig;
      delete config.NetworkingConfig;
      if (containers.some((container) => container.name === name)) {
        return { status: 409, json: { message: "name in use" } };
      }
      const image = images.find((candidate) => candidate.reference === config.Image);
      if (image === undefined) {
        return notFound();
      }
      const id = `id-${name}-${containers.length}`;
      containers.push({
        id,
        name,
        image: image.id,
        config,
        env: (env as string[] | undefined) ?? [],
        labels: (config.Labels as Record<string, string> | undefined) ?? {},
        running: false,
        exitCode: 0,
      });
      return { status: 201, json: { Id: id } };
    }
    const inspect = /^\/containers\/([^/]+)\/json$/.exec(path);
    if (method === "GET" && inspect !== null) {
      const container = findContainer(containers, decodeURIComponent(inspect[1] ?? ""));
      return container === undefined
        ? notFound()
        : { status: 200, json: inspectOf(container, images) };
    }
    const action = /^\/containers\/([^/]+)\/([a-z]+)$/.exec(path);
    if (action !== null) {
      const container = findContainer(containers, decodeURIComponent(action[1] ?? ""));
      if (container === undefined) {
        return notFound();
      }
      return handleAction(container, action[2] ?? "", url, containers);
    }
    if (method === "DELETE" && path.startsWith("/containers/")) {
      const reference = decodeURIComponent(path.slice("/containers/".length));
      const index = containers.findIndex(
        (container) => container.id === reference || container.name === reference,
      );
      if (index === -1) {
        return notFound();
      }
      containers.splice(index, 1);
      return { status: 204 };
    }
    return { status: 500, text: `unexpected ${method} ${path}` };
  };

  const handleAction = (
    container: Container,
    action: string,
    url: URL,
    all: Container[],
  ): Reply => {
    if (action === "start" || action === "stop") {
      const running = action === "start";
      if (container.running === running) {
        return { status: 304 };
      }
      container.running = running;
      return { status: 204 };
    }
    if (action === "rename") {
      container.name = url.searchParams.get("name") ?? container.name;
      return { status: 204 };
    }
    if (action === "wait") {
      return { status: 200, json: { StatusCode: options.initExitCode ?? container.exitCode } };
    }
    return { status: 500, text: `unexpected action ${action} on ${all.length}` };
  };

  const server = createServer((request, response: ServerResponse) => {
    void readBody(request).then((body) => {
      const url = new URL(request.url ?? "/", "http://engine");
      const method = request.method ?? "GET";
      requests.push({
        method,
        path: `${url.pathname}${url.search}`,
        body: body === "" ? undefined : JSON.parse(body),
      });
      const reply = handle(method, url, body);
      response.writeHead(reply.status, { "content-type": "application/json" });
      response.end(reply.text ?? (reply.json === undefined ? "" : JSON.stringify(reply.json)));
    });
  });
  await new Promise<void>((resolve) => server.listen(socketPath, resolve));

  return {
    socketPath,
    requests,
    containerNames: () => containers.map((container) => container.name),
    containerNamed: (name) => {
      const container = containers.find((candidate) => candidate.name === name);
      return container === undefined
        ? undefined
        : { image: String(container.config.Image), env: container.env, running: container.running };
    },
    close: async () => {
      await new Promise<void>((resolve) => server.close(() => resolve()));
      rmSync(directory, { recursive: true, force: true });
    },
  };
};
