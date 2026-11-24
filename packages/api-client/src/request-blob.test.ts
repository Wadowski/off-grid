// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it, vi } from "vitest";
import { ApiError, createApiClient } from "./index.js";

const BASE_URL = "http://localhost:3000/api";

const clientWith = (response: Response) => {
  const transport = vi.fn<typeof fetch>().mockResolvedValue(response);
  return { client: createApiClient({ baseUrl: BASE_URL, fetch: transport }), transport };
};

describe("requestBlob", () => {
  it("returns the response body as a blob with the session transport", async () => {
    const { client, transport } = clientWith(new Response("hello", { status: 200 }));

    const blob = await client.requestBlob("/files/1/versions/2/content");
    expect(await blob.text()).toBe("hello");
    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/files/1/versions/2/content`,
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("maps a failed response to an ApiError with the server code", async () => {
    const { client } = clientWith(
      new Response(JSON.stringify({ code: "NOT_FOUND", message: "Missing" }), { status: 404 }),
    );

    const failure = await client.requestBlob("/files/1/versions/2/content").catch((error) => error);
    expect(failure).toBeInstanceOf(ApiError);
    expect(failure).toMatchObject({ status: 404, code: "NOT_FOUND" });
  });
});
