// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, MaterialIcon, Text, cssVar } from "@offgrid/ui";
import type { EmptyTrashButtonProps } from "./types.js";

export const EmptyTrashButton = ({ disabled, onEmpty }: EmptyTrashButtonProps) => (
  <Button
    variant="secondary"
    size="small"
    disabled={disabled}
    onClick={onEmpty}
    data-testid="trash-empty-button"
  >
    <MaterialIcon name="delete_forever" size="1.125rem" color={cssVar("color-danger")} />
    <Text variant="action" element="span" textId="files.trash.emptyTrash" />
  </Button>
);
