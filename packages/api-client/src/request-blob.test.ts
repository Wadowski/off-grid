// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it, vi } from "vitest";
import { ApiError } from "./api-error.js";
import { requestBlob } from "./request-blob.js";

const BASE_URL = "http://localhost:3000/api";

const transportReturning = (response: Response) =>
  vi.fn<typeof fetch>().mockResolvedValue(response);

describe("requestBlob", () => {
  it("returns the response body as a blob with its media type", async () => {
    const transport = transportReturning(
      new Response("hello", { status: 200, headers: { "content-type": "text/plain" } }),
    );

    const blob = await requestBlob(transport, BASE_URL, "/files/1/content");

    expect(blob.type).toBe("text/plain");
    expect(await blob.text()).toBe("hello");
    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/files/1/content`,
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("throws the coded API error of an error response", async () => {
    const transport = transportReturning(
      new Response(JSON.stringify({ code: "NOT_FOUND", message: "File not found." }), {
        status: 404,
        headers: { "content-type": "application/json" },
      }),
    );

    const failure = await requestBlob(transport, BASE_URL, "/files/1/content").catch(
      (error: unknown) => error,
    );

    expect(failure).toBeInstanceOf(ApiError);
    expect(failure).toMatchObject({ status: 404, code: "NOT_FOUND" });
  });

  it("reports an unexpected response when the error body is not JSON", async () => {
    const transport = transportReturning(new Response("oops", { status: 502 }));

    const failure = await requestBlob(transport, BASE_URL, "/files/1/content").catch(
      (error: unknown) => error,
    );

    expect(failure).toMatchObject({ status: 502, code: "UNEXPECTED_RESPONSE" });
  });
});
