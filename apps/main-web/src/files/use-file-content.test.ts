// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getFileContent } from "./files-api.js";
import type { RegularFileEntry } from "./types.js";
import { useFileContent } from "./use-file-content.js";

vi.mock("./files-api.js", () => ({ getFileContent: vi.fn() }));

const IMAGE = {
  id: "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a",
  name: "Beach.png",
  mimeType: "image/png",
} as RegularFileEntry;
const OBJECT_URL = "blob:http://localhost/preview";

beforeEach(() => {
  vi.resetAllMocks();
  URL.createObjectURL = vi.fn(() => OBJECT_URL);
  URL.revokeObjectURL = vi.fn();
});

describe("useFileContent", () => {
  it("loads the inline content and exposes an object URL with its kind", async () => {
    vi.mocked(getFileContent).mockResolvedValue(new Blob(["png"], { type: "image/png" }));

    const { result } = renderHook(() => useFileContent(IMAGE));

    expect(result.current.state).toEqual({ status: "loading" });
    await waitFor(() =>
      expect(result.current.state).toEqual({
        status: "ready",
        kind: "image",
        objectUrl: OBJECT_URL,
      }),
    );
    expect(getFileContent).toHaveBeenCalledWith(IMAGE.id, { disposition: "inline" });
  });

  it("revokes the object URL when it unmounts", async () => {
    vi.mocked(getFileContent).mockResolvedValue(new Blob(["png"], { type: "image/png" }));
    const { result, unmount } = renderHook(() => useFileContent(IMAGE));
    await waitFor(() => expect(result.current.state.status).toBe("ready"));

    unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith(OBJECT_URL);
  });

  it("does not load a file whose type cannot be previewed", async () => {
    const page = { ...IMAGE, mimeType: "text/html" } as RegularFileEntry;

    const { result } = renderHook(() => useFileContent(page));

    await waitFor(() => expect(result.current.state).toEqual({ status: "unsupported" }));
    expect(getFileContent).not.toHaveBeenCalled();
  });

  it("falls back to unsupported when the server answers with a type that is not safe", async () => {
    vi.mocked(getFileContent).mockResolvedValue(
      new Blob(["x"], { type: "application/octet-stream" }),
    );

    const { result } = renderHook(() => useFileContent(IMAGE));

    await waitFor(() => expect(result.current.state).toEqual({ status: "unsupported" }));
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it("reports the mapped error and loads again on retry", async () => {
    vi.mocked(getFileContent).mockRejectedValueOnce(new ApiError(404, "NOT_FOUND", "gone"));
    const { result } = renderHook(() => useFileContent(IMAGE));
    await waitFor(() =>
      expect(result.current.state).toEqual({
        status: "failed",
        errorTextId: "files.errors.notFound",
      }),
    );

    vi.mocked(getFileContent).mockResolvedValueOnce(new Blob(["png"], { type: "image/png" }));
    act(() => result.current.retry());

    await waitFor(() => expect(result.current.state.status).toBe("ready"));
    expect(getFileContent).toHaveBeenCalledTimes(2);
  });

  it("ignores a response that arrives after unmount", async () => {
    let finish: (blob: Blob) => void = () => undefined;
    vi.mocked(getFileContent).mockReturnValue(new Promise<Blob>((resolve) => (finish = resolve)));
    const { unmount } = renderHook(() => useFileContent(IMAGE));

    unmount();
    await act(async () => finish(new Blob(["png"], { type: "image/png" })));

    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });
});
