// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useEffect, useState } from "react";
import { NARROW_MEDIA_QUERY } from "../constants.js";

export const useIsNarrow = (): boolean => {
  const [narrow, setNarrow] = useState(() => window.matchMedia(NARROW_MEDIA_QUERY).matches);

  useEffect(() => {
    const query = window.matchMedia(NARROW_MEDIA_QUERY);
    const update = () => setNarrow(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return narrow;
};
