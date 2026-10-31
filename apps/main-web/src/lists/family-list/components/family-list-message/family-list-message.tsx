// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import type { FamilyListMessageContent } from "./types.js";

export const FamilyListMessage = (content: FamilyListMessageContent) => (
  <Text
    variant={content.variant}
    textId={content.textId}
    role={content.role}
    data-testid={content.testId}
  />
);
