// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { IncomingHttpHeaders } from "node:http";
import type { FastifyInstance, FastifyRequest } from "fastify";
import type { z } from "zod";
import type { DatabaseTarget, MigrationSource, ModuleDatabase } from "@offgrid/db";
import type { EventBus } from "@offgrid/event-bus";
import type { ErrorSink, LogLevel, Logger } from "@offgrid/observability";
import type { Pool } from "pg";
import type { accessGroupIdSchema, familyIdSchema, userIdSchema } from "@offgrid/contracts";

export interface DatabaseConnection {
  readonly host: string;
  readonly port: number;
  readonly name: string;
  readonly user: string;
  readonly password: string;
  readonly poolMax: number;
}

export interface ServerConfig {
  readonly http: { readonly host: string; readonly port: number };
  readonly database: DatabaseConnection;
  readonly trustedProxies: readonly string[];
  readonly rateLimitPerMinute: number;
  readonly logLevel: LogLevel;
}

export type ReadSecretFile = (path: string) => string;

export interface ModuleContext {
  readonly eventBus: EventBus;
  readonly logger: Logger;
  readonly db: ModuleDatabase;
  readonly currentUserId: (request: FastifyRequest) => string | null;
}

export interface Worker {
  readonly name: string;
  start(): Promise<void>;
  stop(): Promise<void>;
}

export interface ModuleDescriptor {
  readonly name: string;
  readonly migrations?: readonly MigrationSource[];
  registerRoutes?(api: FastifyInstance, context: ModuleContext): void | Promise<void>;
  registerSubscribers?(context: ModuleContext): void;
  workers?(context: ModuleContext): readonly Worker[];
}

interface RuntimeState {
  publisherRunning: boolean;
  draining: boolean;
}

export interface ServerRuntime {
  readonly pool: Pick<Pool, "query" | "end" | "connect">;
  readonly database: DatabaseTarget;
  readonly moduleDatabases: Map<string, ModuleDatabase>;
  readonly eventBus: EventBus;
  readonly errorSink: ErrorSink;
  readonly logger: Logger;
  readonly state: RuntimeState;
}

export type IdentityResolver = (headers: IncomingHttpHeaders) => RequestContext;

export interface AppOptions {
  readonly config: ServerConfig;
  readonly runtime: ServerRuntime;
  readonly modules: readonly ModuleDescriptor[];
  readonly identity?: IdentityResolver;
  readonly migrations?: readonly MigrationSource[];
}

export interface AppliedMigrationRow {
  readonly module: string;
  readonly name: string;
  readonly checksum: string;
}

export interface RequestContext {
  readonly userId: z.output<typeof userIdSchema> | null;
  readonly familyId: z.output<typeof familyIdSchema> | null;
  readonly accessGroupIds: readonly z.output<typeof accessGroupIdSchema>[];
}

export interface ErrorBody {
  readonly code: string;
  readonly message: string;
}

export type CheckStatus = "ok" | "unavailable" | "stopped" | "pending";

export interface ReadinessChecks {
  readonly database: CheckStatus;
  readonly publisher: CheckStatus;
  readonly migrations: CheckStatus;
}

export interface RunningServer {
  readonly baseUrl: string;
  close(): Promise<void>;
}

declare module "fastify" {
  interface FastifyRequest {
    requestContext: RequestContext;
  }
}
