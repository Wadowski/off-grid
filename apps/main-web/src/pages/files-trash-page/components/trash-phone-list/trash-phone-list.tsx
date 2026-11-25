// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FileRow } from "@offgrid/ui";
import { toTrashRowValues } from "../../../../files/to-trash-row-values.js";
import { RestoreButton } from "../restore-button/restore-button.js";
import type { TrashPhoneListProps } from "./types.js";

export const TrashPhoneList = ({ items, restoring, onRestore }: TrashPhoneListProps) => (
  <div data-testid="trash-list">
    {items.map((item) => (
      <FileRow
        key={item.id}
        {...toTrashRowValues(item)}
        trailing={
          <RestoreButton
            name={item.name}
            entryId={item.id}
            disabled={restoring}
            compact
            onRestore={() => onRestore(item)}
          />
        }
      />
    ))}
  </div>
);
