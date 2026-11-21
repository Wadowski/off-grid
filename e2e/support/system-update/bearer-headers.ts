// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Session } from "../factories/instance-admin.js";

export const bearerHeaders = (session: Session): Record<string, string> => ({
  authorization: `Bearer ${session.accessToken}`,
});
