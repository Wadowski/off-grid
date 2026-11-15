// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { NARROW_MEDIA_QUERY } from "../constants.js";
import { useMediaQuery } from "./use-media-query.js";

export const useIsNarrow = (): boolean => useMediaQuery(NARROW_MEDIA_QUERY);
