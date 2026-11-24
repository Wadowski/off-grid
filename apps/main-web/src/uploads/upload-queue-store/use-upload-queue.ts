// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback, useEffect, useReducer, useRef } from "react";
import { useSession } from "../../session/use-session.js";
import { EMPTY_UPLOAD_QUEUE_STATE } from "../constants.js";
import type { RunningUpload, UploadQueue, UploadTarget } from "../types.js";
import { createUploadItem } from "./create-upload-item.js";
import { nextQueuedItem } from "./next-queued-item.js";
import { startUpload } from "./start-upload.js";
import { uploadQueueReducer } from "./upload-queue-reducer.js";

export const useUploadQueue = (): UploadQueue => {
  const session = useSession();
  const activeFamilyId = session.status === "signedIn" ? session.activeFamilyId : null;
  const [state, dispatch] = useReducer(uploadQueueReducer, EMPTY_UPLOAD_QUEUE_STATE);
  const running = useRef<RunningUpload | null>(null);
  const knownFamilyId = useRef(activeFamilyId);

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
      running.current?.controller.abort();
      running.current = null;
    },
    [],
  );

  const enqueue = useCallback(
    (files: readonly File[], target: UploadTarget) => {
      dispatch({
        type: "enqueued",
        items: files.map((file) =>
          createUploadItem(crypto.randomUUID(), file, target, activeFamilyId),
        ),
      });
    },
    [activeFamilyId],
  );

  const clearFinished = useCallback(() => dispatch({ type: "clearedFinished" }), []);

  return {
    items: state.items,
    isIdle: !state.items.some((item) => item.status === "queued" || item.status === "uploading"),
    lastDone: state.lastDone,
    announcement: state.announcement,
    enqueue,
    clearFinished,
  };
};
