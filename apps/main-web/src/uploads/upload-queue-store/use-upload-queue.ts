// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback, useEffect, useReducer, useRef } from "react";
import { useSession } from "../../session/use-session.js";
import { EMPTY_UPLOAD_QUEUE_STATE } from "../constants.js";
import type {
  RunningUpload,
  UploadItem,
  UploadQueue,
  UploadTarget,
  VersionUploadTarget,
} from "../types.js";
import { createCheckedUploadItem } from "./create-checked-upload-item.js";
import { isActiveUploadItem } from "./is-active-upload-item.js";
import { isRetryableUploadItem } from "./is-retryable-upload-item.js";
import { nextQueuedItem } from "./next-queued-item.js";
import { startUpload } from "./start-upload.js";
import { uploadQueueReducer } from "./upload-queue-reducer.js";
import { useUploadLimit } from "../../files/use-upload-limit.js";

export const useUploadQueue = (): UploadQueue => {
  const session = useSession();
  const activeFamilyId = session.status === "signedIn" ? session.activeFamilyId : null;
  const [state, dispatch] = useReducer(uploadQueueReducer, EMPTY_UPLOAD_QUEUE_STATE);
  const running = useRef<RunningUpload | null>(null);
  const knownFamilyId = useRef(activeFamilyId);
  const maxUploadBytes = useUploadLimit(session.status === "signedIn");

  useEffect(() => {
    if (running.current !== null) {
      return;
    }
    const next = nextQueuedItem(state.items);
    if (next !== undefined && next.file !== null) {
      startUpload(next, next.file, dispatch, running);
    }
  }, [state.items]);

  useEffect(() => {
    if (knownFamilyId.current === activeFamilyId) {
      return;
    }
    knownFamilyId.current = activeFamilyId;
    running.current?.controller.abort();
    running.current = null;
    dispatch({ type: "familySwitched", errorTextId: "files.upload.stoppedFamilySwitch" });
  }, [activeFamilyId]);

  useEffect(
    () => () => {
      if (running.current === null) {
        return;
      }
      running.current.controller.abort();
      running.current = null;
      dispatch({ type: "familySwitched", errorTextId: "files.upload.stoppedFamilySwitch" });
    },
    [],
  );

  const enqueue = useCallback(
    (files: readonly File[], target: UploadTarget) => {
      dispatch({
        type: "enqueued",
        items: files.map((file) =>
          createCheckedUploadItem(
            crypto.randomUUID(),
            file,
            target,
            activeFamilyId,
            null,
            maxUploadBytes,
          ),
        ),
      });
    },
    [activeFamilyId, maxUploadBytes],
  );

  const enqueueVersion = useCallback(
    (file: File, target: VersionUploadTarget) => {
      dispatch({
        type: "enqueued",
        items: [
          createCheckedUploadItem(
            crypto.randomUUID(),
            file,
            target,
            activeFamilyId,
            target.fileId,
            maxUploadBytes,
          ),
        ],
      });
    },
    [activeFamilyId, maxUploadBytes],
  );

  const isRetryable = useCallback(
    (item: UploadItem) => isRetryableUploadItem(item, activeFamilyId),
    [activeFamilyId],
  );

  const retry = useCallback(
    (id: string) => {
      const item = state.items.find((candidate) => candidate.id === id);
      if (item === undefined || !isRetryableUploadItem(item, activeFamilyId)) {
        return;
      }
      dispatch({ type: "retried", id });
    },
    [state.items, activeFamilyId],
  );

  const dismiss = useCallback((id: string) => dispatch({ type: "dismissed", id }), []);

  const clearFinished = useCallback(() => dispatch({ type: "clearedFinished" }), []);

  return {
    items: state.items,
    isIdle: !state.items.some(isActiveUploadItem),
    lastDone: state.lastDone,
    announcement: state.announcement,
    enqueue,
    enqueueVersion,
    isRetryable,
    retry,
    dismiss,
    clearFinished,
  };
};
