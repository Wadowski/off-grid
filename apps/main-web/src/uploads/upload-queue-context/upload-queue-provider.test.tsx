// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { act, render, renderHook } from "@testing-library/react";
import { Activity, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@offgrid/api-client";
import { uploadFile, uploadFileVersion } from "../../files/files-api.js";
import { setSessionState } from "../../session/set-session-state.js";
import type { UploadQueue, UploadTarget, VersionUploadTarget } from "../types.js";
import { useUploadQueueContext } from "./use-upload-queue-context.js";
import { UploadQueueProvider } from "./upload-queue-provider.js";

vi.mock("../../files/files-api.js", () => ({ uploadFile: vi.fn(), uploadFileVersion: vi.fn() }));

const TARGET: UploadTarget = {
  driveId: "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as UploadTarget["driveId"],
  folderId: null,
};
const FAMILY_A = "a0000000-0000-4000-8000-000000000001";
const FAMILY_B = "b0000000-0000-4000-8000-000000000002";
const VERSION_FILE_ID = "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b" as VersionUploadTarget["fileId"];

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
      fileId: null,
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

  it("does not leave a row uploading when its effects are cleaned up and the queue state survives", async () => {
    const probe: { queue: UploadQueue | null } = { queue: null };
    const Probe = () => {
      probe.queue = useUploadQueueContext();
      return null;
    };
    const tree = (mode: "visible" | "hidden") => (
      <Activity mode={mode}>
        <UploadQueueProvider>
          <Probe />
        </UploadQueueProvider>
      </Activity>
    );
    const { rerender } = render(tree("visible"));
    act(() => {
      probe.queue?.enqueue([new File(["a"], "a.txt")], TARGET);
    });

    rerender(tree("hidden"));
    rerender(tree("visible"));

    expect(pending[0]?.signal.aborted).toBe(true);
    expect(probe.queue?.items[0]?.status).toBe("failed");
    expect(probe.queue?.items[0]?.errorTextId).toBe("files.upload.stoppedFamilySwitch");
    expect(uploadMock).toHaveBeenCalledTimes(1);
  });
  it("uploads a new version of an existing file through the version endpoint", async () => {
    const versionUploadMock = vi.mocked(uploadFileVersion);
    versionUploadMock.mockResolvedValue({} as never);
    const { result } = renderHook(() => useUploadQueueContext(), { wrapper });
    const versionTarget: VersionUploadTarget = { ...TARGET, fileId: VERSION_FILE_ID };

    act(() => {
      result.current.enqueueVersion(new File(["a"], "Trip.pdf"), versionTarget);
    });
    await act(async () => undefined);

    expect(versionUploadMock).toHaveBeenCalledWith(
      VERSION_FILE_ID,
      expect.objectContaining({ file: expect.objectContaining({ name: "Trip.pdf" }) }),
    );
    expect(uploadMock).not.toHaveBeenCalled();
    expect(result.current.lastDone).toEqual({
      itemId: result.current.items[0]?.id,
      driveId: TARGET.driveId,
      folderId: null,
      fileId: VERSION_FILE_ID,
    });
  });
  it("sends a failed upload again to the same target when it is retried", async () => {
    const { result } = renderHook(() => useUploadQueueContext(), { wrapper });
    act(() => {
      result.current.enqueue([new File(["a"], "a.txt")], TARGET);
    });
    await act(async () => {
      pending[0]?.reject(new Error("network down"));
    });

    act(() => {
      result.current.retry(result.current.items[0]?.id ?? "");
    });

    expect(sentNames()).toEqual(["a.txt", "a.txt"]);
    expect(uploadMock.mock.calls[1]?.[0]).toBe(TARGET.driveId);
    expect(statusesOf(result)).toEqual(["a.txt:uploading"]);
  });

  it("does not offer a retry for a file above the limit and ignores one", async () => {
    const { result } = renderHook(() => useUploadQueueContext(), { wrapper });
    act(() => {
      result.current.enqueue([new File(["a"], "big.bin")], TARGET);
    });
    await act(async () => {
      pending[0]?.reject(new ApiError(413, "PAYLOAD_TOO_LARGE", "too big"));
    });

    expect(result.current.isRetryable(result.current.items[0] as never)).toBe(false);
    act(() => {
      result.current.retry(result.current.items[0]?.id ?? "");
    });

    expect(sentNames()).toEqual(["big.bin"]);
    expect(statusesOf(result)).toEqual(["big.bin:failed"]);
  });

  it("removes a failed item when it is dismissed", async () => {
    const { result } = renderHook(() => useUploadQueueContext(), { wrapper });
    act(() => {
      result.current.enqueue([new File(["a"], "a.txt"), new File(["b"], "b.txt")], TARGET);
    });
    await act(async () => {
      pending[0]?.reject(new Error("network down"));
    });

    act(() => {
      result.current.dismiss(result.current.items[0]?.id ?? "");
    });

    expect(statusesOf(result)).toEqual(["b.txt:uploading"]);
  });
});
