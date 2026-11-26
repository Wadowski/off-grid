// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useEffect, useRef } from "react";

export const useRefreshOnFilesChanged = (
  filesChangedCount: number,
  refreshQuietly: () => Promise<void>,
): void => {
  const seenCount = useRef(filesChangedCount);

  useEffect(() => {
    if (seenCount.current === filesChangedCount) {
      return;
    }
    seenCount.current = filesChangedCount;
    void refreshQuietly();
  }, [filesChangedCount, refreshQuietly]);
};
