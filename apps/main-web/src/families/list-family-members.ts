// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { webFamilyClient } from "../api/web-api-client.js";

export const listFamilyMembers = (familyId: string) => webFamilyClient.listFamilyMembers(familyId);
