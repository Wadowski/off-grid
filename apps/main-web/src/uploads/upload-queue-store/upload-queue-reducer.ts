// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { removeFinishedItems } from "./remove-finished-items.js";
import { failUnfinishedItems } from "./fail-unfinished-items.js";
import { toUploadAnnouncement } from "./to-upload-announcement.js";
import { updateUploadItem } from "./update-upload-item.js";
import type { UploadItem, UploadQueueAction, UploadQueueState } from "../types.js";

const findItem = (state: UploadQueueState, id: string): UploadItem | undefined =>
  state.items.find((item) => item.id === id);

export const uploadQueueReducer = (
  state: UploadQueueState,
  action: UploadQueueAction,
): UploadQueueState => {
  switch (action.type) {
    case "enqueued":
      return { ...state, items: [...state.items, ...action.items] };
    case "started": {
      const item = findItem(state, action.id);
      if (item === undefined) {
        return state;
      }
      return {
        ...state,
        items: updateUploadItem(state.items, action.id, { status: "uploading", percent: 0 }),
        announcement: toUploadAnnouncement(
          state.announcement,
          "files.upload.announceStart",
          item,
          null,
        ),
      };
    }
    case "progressed": {
      const item = findItem(state, action.id);
      if (item === undefined || item.percent === action.percent) {
        return state;
      }
      return {
        ...state,
        items: updateUploadItem(state.items, action.id, { percent: action.percent }),
      };
    }
    case "finished": {
      const item = findItem(state, action.id);
      if (item === undefined) {
        return state;
      }
      return {
        ...state,
        items: updateUploadItem(state.items, action.id, {
          status: "done",
          percent: 100,
          errorTextId: null,
          file: null,
        }),
        lastDone: { itemId: item.id, driveId: item.driveId, folderId: item.folderId },
        announcement: toUploadAnnouncement(
          state.announcement,
          "files.upload.announceDone",
          item,
          null,
        ),
      };
    }
    case "failed": {
      const item = findItem(state, action.id);
      if (item === undefined) {
        return state;
      }
      return {
        ...state,
        items: updateUploadItem(state.items, action.id, {
          status: "failed",
          errorTextId: action.errorTextId,
          file: null,
        }),
        announcement: toUploadAnnouncement(
          state.announcement,
          "files.upload.announceFailed",
          item,
          action.errorTextId,
        ),
      };
    }
    case "familySwitched":
      return { ...state, items: failUnfinishedItems(state.items, action.errorTextId) };
    case "clearedFinished":
      return { ...state, items: removeFinishedItems(state.items) };
  }
};
