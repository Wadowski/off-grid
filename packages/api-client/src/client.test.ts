// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it, vi } from "vitest";
import { ApiError, createApiClient } from "./index.js";

const jsonResponse = (body: unknown, status = 200): Response => {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
};

const clientWith = (response: Response) => {
  const transport = vi.fn<typeof fetch>().mockResolvedValue(response);
  const client = createApiClient({ baseUrl: "http://localhost:3000/api", fetch: transport });
  return { client, transport };
};

describe("createApiClient", () => {
  it("returns the parsed JSON body of a successful response", async () => {
    const { client } = clientWith(jsonResponse({ id: "1" }));

    await expect(client.request("GET", "/families/1")).resolves.toEqual({ id: "1" });
  });

  it("returns undefined for a 204 response", async () => {
    const { client } = clientWith(new Response(null, { status: 204 }));

    await expect(client.request("DELETE", "/families/1")).resolves.toBeUndefined();
  });

  it("sends only the headers the server expects and serialises the body", async () => {
    const { client, transport } = clientWith(jsonResponse({ id: "1" }, 201));

    await client.request("POST", "/families", { name: "Kowalski" });

    expect(transport).toHaveBeenCalledWith("http://localhost:3000/api/families", {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json" },
      body: '{"name":"Kowalski"}',
    });
  });

  it("omits the content type and body when there is no request body", async () => {
    const { client, transport } = clientWith(jsonResponse([]));

    await client.request("GET", "/families");

    expect(transport).toHaveBeenCalledWith("http://localhost:3000/api/families", {
      method: "GET",
      headers: { accept: "application/json" },
      body: undefined,
    });
  });

  it("maps the standard ErrorResponse shape to an ApiError", async () => {
    const { client } = clientWith(
      jsonResponse({ code: "VALIDATION_FAILED", message: "Name is required." }, 400),
    );

    const error = await client.request("POST", "/families", {}).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      name: "ApiError",
      status: 400,
      code: "VALIDATION_FAILED",
      message: "Name is required.",
    });
  });

  it("falls back to UNEXPECTED_RESPONSE when the error body is not an ErrorResponse", async () => {
    const { client } = clientWith(
      new Response("<html>bad gateway</html>", { status: 502, statusText: "Bad Gateway" }),
    );

    const error = await client.request("GET", "/families").catch((caught: unknown) => caught);

    expect(error).toMatchObject({
      status: 502,
      code: "UNEXPECTED_RESPONSE",
      message: "Bad Gateway",
    });
  });
});
