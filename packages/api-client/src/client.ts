// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { errorResponseSchema } from "@offgrid/contracts";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export type ApiClientOptions = {
  baseUrl: string;
  fetch?: typeof fetch;
};

export function createApiClient({ baseUrl, fetch: transport = fetch }: ApiClientOptions) {
  async function request(method: HttpMethod, path: string, body?: unknown): Promise<unknown> {
    const response = await transport(`${baseUrl}${path}`, {
      method,
      headers: requestHeaders(body),
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (response.ok) {
      return response.status === 204 ? undefined : response.json();
    }
    throw await toApiError(response);
  }

  return { request };
}

function requestHeaders(body: unknown): Record<string, string> {
  if (body === undefined) {
    return { accept: "application/json" };
  }
  return { accept: "application/json", "content-type": "application/json" };
}

async function toApiError(response: Response): Promise<ApiError> {
  const parsed = errorResponseSchema.safeParse(await response.json().catch(() => undefined));
  if (parsed.success) {
    return new ApiError(response.status, parsed.data.code, parsed.data.message);
  }
  return new ApiError(
    response.status,
    "UNEXPECTED_RESPONSE",
    response.statusText || "Request failed.",
  );
}
