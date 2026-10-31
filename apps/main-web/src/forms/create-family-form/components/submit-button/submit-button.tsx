// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { createFamilySubmitStyle } from "./styles.js";
import type { SubmitButtonProps } from "./types.js";

export const SubmitButton = ({ status }: SubmitButtonProps) => {
  const busy = status === "submitting" || status === "waiting-for-list";

  return (
    <div style={createFamilySubmitStyle}>
      <Button type="submit" data-testid="create-family-submit" disabled={busy}>
        <Text variant="action" textId="families.submit" />
      </Button>
    </div>
  );
};
