// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { EMPTY_UPLOAD_QUEUE_STATE } from "../constants.js";
import type { UploadQueueState, UploadTarget } from "../types.js";
import { createUploadItem } from "./create-upload-item.js";
import { uploadQueueReducer } from "./upload-queue-reducer.js";

const TARGET: UploadTarget = {
  driveId: "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d",
  folderId: null,
} as UploadTarget;

const queuedState = (...names: string[]): UploadQueueState =>
  uploadQueueReducer(EMPTY_UPLOAD_QUEUE_STATE, {
    type: "enqueued",
    items: names.map((name) =>
      createUploadItem(`id-${name}`, new File(["x"], name), TARGET, "family-1", null),
    ),
  });

describe("uploadQueueReducer", () => {
  it("appends enqueued files in pick order, queued", () => {
    const state = queuedState("a.txt", "b.txt");

    expect(state.items.map((item) => [item.name, item.status])).toEqual([
      ["a.txt", "queued"],
      ["b.txt", "queued"],
    ]);
  });

  it("marks an item uploading and announces the start", () => {
    const state = uploadQueueReducer(queuedState("a.txt"), { type: "started", id: "id-a.txt" });

    expect(state.items[0]?.status).toBe("uploading");
    expect(state.announcement).toMatchObject({
      sequence: 1,
      textId: "files.upload.announceStart",
      name: "a.txt",
      reasonTextId: null,
    });
  });

  it("stores the whole-percent progress and ignores an unchanged percent", () => {
    const started = uploadQueueReducer(queuedState("a.txt"), { type: "started", id: "id-a.txt" });
    const progressed = uploadQueueReducer(started, {
      type: "progressed",
      id: "id-a.txt",
      percent: 40,
    });

    expect(progressed.items[0]?.percent).toBe(40);
    expect(
      uploadQueueReducer(progressed, { type: "progressed", id: "id-a.txt", percent: 40 }),
    ).toBe(progressed);
  });

  it("marks an item done, drops its file and records it as the last finished upload", () => {
    const state = uploadQueueReducer(queuedState("a.txt"), { type: "finished", id: "id-a.txt" });

    expect(state.items[0]).toMatchObject({ status: "done", percent: 100, file: null });
    expect(state.lastDone).toEqual({
      itemId: "id-a.txt",
      driveId: TARGET.driveId,
      folderId: null,
      fileId: null,
    });
    expect(state.announcement?.textId).toBe("files.upload.announceDone");
  });

  it("marks an item failed with its error text and announces the reason", () => {
    const state = uploadQueueReducer(queuedState("a.txt"), {
      type: "failed",
      id: "id-a.txt",
      errorTextId: "files.errors.payloadTooLarge",
    });

    expect(state.items[0]).toMatchObject({
      status: "failed",
      errorTextId: "files.errors.payloadTooLarge",
      file: null,
    });
    expect(state.announcement).toMatchObject({
      textId: "files.upload.announceFailed",
      reasonTextId: "files.errors.payloadTooLarge",
    });
  });

  it("fails every queued or uploading item when the family space changes and keeps finished rows", () => {
    const finished = uploadQueueReducer(queuedState("a.txt", "b.txt", "c.txt"), {
      type: "finished",
      id: "id-a.txt",
    });
    const started = uploadQueueReducer(finished, { type: "started", id: "id-b.txt" });

    const state = uploadQueueReducer(started, {
      type: "familySwitched",
      errorTextId: "files.upload.stoppedFamilySwitch",
    });

    expect(state.items.map((item) => item.status)).toEqual(["done", "failed", "failed"]);
    expect(state.items[1]?.errorTextId).toBe("files.upload.stoppedFamilySwitch");
  });

  it("removes only the finished rows when cleared", () => {
    const finished = uploadQueueReducer(queuedState("a.txt", "b.txt"), {
      type: "finished",
      id: "id-a.txt",
    });

    const state = uploadQueueReducer(finished, { type: "clearedFinished" });

    expect(state.items.map((item) => item.name)).toEqual(["b.txt"]);
  });

  it("ignores progress for an item it does not hold", () => {
    const state = queuedState("a.txt");

    expect(uploadQueueReducer(state, { type: "progressed", id: "missing", percent: 10 })).toBe(
      state,
    );
  });
});
