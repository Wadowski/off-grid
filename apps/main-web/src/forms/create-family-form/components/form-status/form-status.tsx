// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { createFamilyStatusTextId } from "./create-family-status-text-id.js";
import type { FormStatusProps } from "./types.js";

export const FormStatus = ({ status }: FormStatusProps) => {
  const textId = createFamilyStatusTextId(status);

  return (
    <div role="status" data-testid="create-family-status">
      {textId !== undefined && <Text variant="status" textId={textId} />}
    </div>
  );
};
