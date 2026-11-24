// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getFileContent } from "./files-api.js";
import { saveBlobAsFile } from "./save-blob-as-file.js";
import type { RegularFileEntry } from "./types.js";
import { useFileDownload } from "./use-file-download.js";

vi.mock("./files-api.js", () => ({ getFileContent: vi.fn() }));
vi.mock("./save-blob-as-file.js", () => ({ saveBlobAsFile: vi.fn() }));

const FILE = {
  id: "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a",
  name: "Notes.txt",
  mimeType: "text/plain",
} as RegularFileEntry;

beforeEach(() => {
  vi.resetAllMocks();
});

describe("useFileDownload", () => {
  it("saves the attachment under the file name", async () => {
    const blob = new Blob(["hello"]);
    vi.mocked(getFileContent).mockResolvedValue(blob);
    const { result } = renderHook(() => useFileDownload(FILE));

    await act(() => result.current.download());

    expect(getFileContent).toHaveBeenCalledWith(FILE.id, { disposition: "attachment" });
    expect(saveBlobAsFile).toHaveBeenCalledWith(blob, "Notes.txt");
    expect(result.current.status).toBe("idle");
  });

  it("is busy while the content loads and ignores a second request", async () => {
    let finish: (blob: Blob) => void = () => undefined;
    vi.mocked(getFileContent).mockReturnValue(new Promise<Blob>((resolve) => (finish = resolve)));
    const { result } = renderHook(() => useFileDownload(FILE));

    act(() => void result.current.download());
    await waitFor(() => expect(result.current.status).toBe("downloading"));
    await act(() => result.current.download());
    await act(async () => finish(new Blob(["hello"])));

    expect(getFileContent).toHaveBeenCalledOnce();
    expect(result.current.status).toBe("idle");
  });

  it("reports the mapped error text id and allows a retry", async () => {
    vi.mocked(getFileContent).mockRejectedValueOnce(new ApiError(404, "NOT_FOUND", "gone"));
    const { result } = renderHook(() => useFileDownload(FILE));

    await act(() => result.current.download());

    expect(result.current.status).toBe("failed");
    expect(result.current.errorTextId).toBe("files.errors.notFound");
    expect(saveBlobAsFile).not.toHaveBeenCalled();

    vi.mocked(getFileContent).mockResolvedValueOnce(new Blob(["hello"]));
    await act(() => result.current.download());

    expect(result.current.status).toBe("idle");
    expect(result.current.errorTextId).toBeNull();
  });
});
