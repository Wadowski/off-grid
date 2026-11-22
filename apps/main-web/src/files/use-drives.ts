// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback, useEffect, useRef, useState } from "react";
import type { ListStatus } from "../types.js";
import { listDrives } from "./files-api.js";
import { toFilesErrorTextId } from "./to-files-error-text-id.js";
import type { Drive, DrivesState, FilesErrorTextId } from "./types.js";

const FAMILY_DRIVE_RETRY_DELAY_MS = 500;
const FAMILY_DRIVE_RETRY_LIMIT = 30;

export const useDrives = (enabled: boolean, expectedFamilyCount = 0): DrivesState => {
  const [drives, setDrives] = useState<readonly Drive[]>([]);
  const [status, setStatus] = useState<ListStatus>("loading");
  const [errorTextId, setErrorTextId] = useState<FilesErrorTextId | null>(null);
  const latestRequest = useRef(0);
  const familyDriveRetries = useRef(0);

  const refresh = useCallback(async () => {
    const request = ++latestRequest.current;
    const isLatest = () => request === latestRequest.current;
    setStatus("loading");
    setErrorTextId(null);
    try {
      const list = await listDrives();
      if (isLatest()) {
        setDrives(list);
        setStatus("ready");
      }
    } catch (error) {
      if (isLatest()) {
        setErrorTextId(toFilesErrorTextId(error));
        setStatus("failed");
      }
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      void refresh();
    }
  }, [enabled, refresh]);

  useEffect(() => {
    const familyDriveMissing =
      status === "ready" &&
      expectedFamilyCount > 0 &&
      !drives.some((drive) => drive.familyId !== null);
    if (!enabled || !familyDriveMissing || familyDriveRetries.current >= FAMILY_DRIVE_RETRY_LIMIT) {
      return;
    }
    const timer = setTimeout(() => {
      familyDriveRetries.current += 1;
      void refresh();
    }, FAMILY_DRIVE_RETRY_DELAY_MS);
    return () => clearTimeout(timer);
  }, [enabled, status, drives, expectedFamilyCount, refresh]);

  return { drives, status, errorTextId, refresh };
};
