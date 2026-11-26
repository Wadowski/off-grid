// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useEffect, useState } from "react";
import { getUploadLimit } from "./get-upload-limit.js";

export const useUploadLimit = (enabled: boolean): number | null => {
  const [maxUploadBytes, setMaxUploadBytes] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    let isCurrent = true;
    getUploadLimit()
      .then((limit) => {
        if (isCurrent) {
          setMaxUploadBytes(limit.maxUploadBytes);
        }
      })
      .catch(() => undefined);
    return () => {
      isCurrent = false;
    };
  }, [enabled]);

  return maxUploadBytes;
};
