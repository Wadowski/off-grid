// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { IncomingHttpHeaders } from "node:http";
import { accessGroupIdSchema, familyIdSchema, userIdSchema } from "@offgrid/contracts";
import { z } from "zod";
import { ApiError } from "./errors.js";
import type { RequestContext } from "./types.js";

const USER_HEADER = "x-offgrid-user-id";
const FAMILY_HEADER = "x-offgrid-family-id";
const ACCESS_GROUPS_HEADER = "x-offgrid-access-group-ids";

const ANONYMOUS: RequestContext = { userId: null, familyId: null, accessGroupIds: [] };

export function resolveRequestContext(
  headers: IncomingHttpHeaders,
  devIdentity: boolean,
): RequestContext {
  if (!devIdentity) {
    return ANONYMOUS;
  }
  return {
    userId: readId(headers, USER_HEADER, userIdSchema),
    familyId: readId(headers, FAMILY_HEADER, familyIdSchema),
    accessGroupIds: readIdList(headers, ACCESS_GROUPS_HEADER),
  };
}

function readId<Schema extends z.ZodType<string>>(
  headers: IncomingHttpHeaders,
  headerName: string,
  schema: Schema,
): z.output<Schema> | null {
  const raw = readSingleHeader(headers, headerName);
  if (raw === undefined) {
    return null;
  }
  return parseOrReject(schema, raw, headerName);
}

function readIdList(
  headers: IncomingHttpHeaders,
  headerName: string,
): z.output<typeof accessGroupIdSchema>[] {
  const raw = readSingleHeader(headers, headerName);
  if (raw === undefined) {
    return [];
  }
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((part) => parseOrReject(accessGroupIdSchema, part, headerName));
}

function readSingleHeader(headers: IncomingHttpHeaders, headerName: string): string | undefined {
  const value = headers[headerName];
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw invalidHeader(headerName);
  }
  return value;
}

function parseOrReject<Schema extends z.ZodType<string>>(
  schema: Schema,
  value: string,
  headerName: string,
): z.output<Schema> {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw invalidHeader(headerName);
  }
  return parsed.data;
}

function invalidHeader(headerName: string): ApiError {
  return new ApiError(400, "INVALID_IDENTITY_HEADER", `${headerName} must be a valid identifier`);
}
