// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@offgrid/api-client";
import { uploadFile } from "../../files/files-api.js";
import { setSessionState } from "../../session/set-session-state.js";
import type { UploadTarget } from "../types.js";
import { useUploadQueueContext } from "./use-upload-queue-context.js";
import { UploadQueueProvider } from "./upload-queue-provider.js";

vi.mock("../../files/files-api.js", () => ({ uploadFile: vi.fn() }));

const TARGET: UploadTarget = {
  driveId: "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as UploadTarget["driveId"],
  folderId: null,
};
const FAMILY_A = "a0000000-0000-4000-8000-000000000001";
const FAMILY_B = "b0000000-0000-4000-8000-000000000002";

const pending: { resolve: () => void; reject: (error: unknown) => void; signal: AbortSignal }[] =
  [];
const uploadMock = vi.mocked(uploadFile);

const wrapper = ({ children }: { children: ReactNode }) => (
  <UploadQueueProvider>{children}</UploadQueueProvider>
);

const signedInAs = (familyId: string) =>
  setSessionState({
    status: "signedIn",
    user: { id: "u", displayName: "Anna", email: "anna@example.test", instanceRole: "member" },
    families: [],
    activeFamilyId: familyId,
  } as never);

const sentNames = () => uploadMock.mock.calls.map(([, input]) => input.file.name);

const statusesOf = (result: { current: ReturnType<typeof useUploadQueueContext> }) =>
  result.current.items.map((item) => `${item.name}:${item.status}`);

beforeEach(() => {
  pending.length = 0;
  uploadMock.mockReset();
  uploadMock.mockImplementation(
    (_driveId, input) =>
      new Promise<never>((resolve, reject) => {
        pending.push({
          resolve: () => resolve({} as never),
          reject,
          signal: input.signal as AbortSignal,
        });
      }),
  );
  signedInAs(FAMILY_A);
});

afterEach(() => {
  setSessionState({ status: "loading" });
});

describe("UploadQueueProvider", () => {
  it("uploads one file at a time in pick order", async () => {
    const { result } = renderHook(() => useUploadQueueContext(), { wrapper });

    act(() => {
      result.current.enqueue([new File(["a"], "a.txt"), new File(["b"], "b.txt")], TARGET);
    });

    expect(sentNames()).toEqual(["a.txt"]);
    await act(async () => {
      pending[0]?.resolve();
    });
    expect(sentNames()).toEqual(["a.txt", "b.txt"]);
    expect(statusesOf(result)).toEqual(["a.txt:done", "b.txt:uploading"]);
  });

  it("keeps uploading the next file after one fails", async () => {
    const { result } = renderHook(() => useUploadQueueContext(), { wrapper });

    act(() => {
      result.current.enqueue([new File(["a"], "big.bin"), new File(["b"], "b.txt")], TARGET);
    });
    await act(async () => {
      pending[0]?.reject(new ApiError(413, "PAYLOAD_TOO_LARGE", "too big"));
    });

    expect(statusesOf(result)).toEqual(["big.bin:failed", "b.txt:uploading"]);
    expect(result.current.items[0]?.errorTextId).toBe("files.errors.payloadTooLarge");
  });

  it("reports the last finished upload with its drive and folder", async () => {
    const { result } = renderHook(() => useUploadQueueContext(), { wrapper });

    act(() => {
      result.current.enqueue([new File(["a"], "a.txt")], TARGET);
    });
    await act(async () => {
      pending[0]?.resolve();
    });

    expect(result.current.lastDone).toEqual({
      itemId: result.current.items[0]?.id,
      driveId: TARGET.driveId,
      folderId: null,
    });
    expect(result.current.isIdle).toBe(true);
  });

  it("is not idle while an upload runs and clears only finished rows", async () => {
    const { result } = renderHook(() => useUploadQueueContext(), { wrapper });

    act(() => {
      result.current.enqueue([new File(["a"], "a.txt")], TARGET);
    });
    expect(result.current.isIdle).toBe(false);

    await act(async () => {
      pending[0]?.resolve();
    });
    act(() => {
      result.current.clearFinished();
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.isIdle).toBe(true);
  });

  it("aborts the running upload and fails the queued ones when the family space changes", async () => {
    const { result } = renderHook(() => useUploadQueueContext(), { wrapper });
    act(() => {
      result.current.enqueue([new File(["a"], "a.txt"), new File(["b"], "b.txt")], TARGET);
    });

    act(() => {
      signedInAs(FAMILY_B);
    });

    expect(pending[0]?.signal.aborted).toBe(true);
    expect(statusesOf(result)).toEqual(["a.txt:failed", "b.txt:failed"]);
    expect(result.current.items[1]?.errorTextId).toBe("files.upload.stoppedFamilySwitch");
    expect(uploadMock).toHaveBeenCalledTimes(1);
  });

  it("aborts the running upload when the provider unmounts", () => {
    const { result, unmount } = renderHook(() => useUploadQueueContext(), { wrapper });
    act(() => {
      result.current.enqueue([new File(["a"], "a.txt")], TARGET);
    });

    unmount();

    expect(pending[0]?.signal.aborted).toBe(true);
  });
});
