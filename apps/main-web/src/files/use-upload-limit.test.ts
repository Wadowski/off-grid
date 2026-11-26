// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getUploadLimit } from "./get-upload-limit.js";
import { useUploadLimit } from "./use-upload-limit.js";

vi.mock("./get-upload-limit.js", () => ({ getUploadLimit: vi.fn() }));

const getUploadLimitMock = vi.mocked(getUploadLimit);

describe("useUploadLimit", () => {
  beforeEach(() => {
    getUploadLimitMock.mockReset();
  });

  it("reads the limit once the person is signed in", async () => {
    getUploadLimitMock.mockResolvedValue({ maxUploadBytes: 2048 });

    const { result } = renderHook(() => useUploadLimit(true));

    await waitFor(() => expect(result.current).toBe(2048));
    expect(getUploadLimitMock).toHaveBeenCalledTimes(1);
  });

  it("does not read the limit before sign-in", () => {
    const { result } = renderHook(() => useUploadLimit(false));

    expect(result.current).toBeNull();
    expect(getUploadLimitMock).not.toHaveBeenCalled();
  });

  it("stays unknown when the limit cannot be read, so the server decides", async () => {
    getUploadLimitMock.mockRejectedValue(new Error("offline"));

    const { result } = renderHook(() => useUploadLimit(true));

    await waitFor(() => expect(getUploadLimitMock).toHaveBeenCalled());
    expect(result.current).toBeNull();
  });
});
