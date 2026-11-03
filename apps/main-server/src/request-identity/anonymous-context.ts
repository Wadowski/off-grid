// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { RequestContext } from "../types.js";

export const anonymousContext = async (): Promise<RequestContext> => {
  return { userId: null, familyId: null, accessGroupIds: [] };
};
