// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { MaterialIcon } from "../../../../icons/material-icon/material-icon.js";
import { createFamilySubmitStyle } from "./styles.js";
import type { SubmitButtonProps } from "./types.js";

export const SubmitButton = ({ status }: SubmitButtonProps) => (
  <div style={createFamilySubmitStyle}>
    <Button
      type="submit"
      fullWidth
      data-testid="create-family-submit"
      disabled={status === "submitting"}
    >
      <Text variant="action" textId="families.submit" />
      <MaterialIcon name="arrow_forward" size="18px" color="currentColor" />
    </Button>
  </div>
);
