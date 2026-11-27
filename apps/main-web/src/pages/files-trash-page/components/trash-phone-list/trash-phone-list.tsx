// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FileRow } from "@offgrid/ui";
import { toTrashRowValues } from "../../../../files/to-trash-row-values.js";
import { trashRowActionsStyle } from "../../styles.js";
import { PurgeButton } from "../purge-button/purge-button.js";
import { RestoreButton } from "../restore-button/restore-button.js";
import type { TrashPhoneListProps } from "./types.js";

export const TrashPhoneList = ({ items, busy, onRestore, onPurge }: TrashPhoneListProps) => (
  <div data-testid="trash-list">
    {items.map((item) => (
      <FileRow
        key={item.id}
        {...toTrashRowValues(item)}
        trailing={
          <div style={trashRowActionsStyle}>
            <RestoreButton
              name={item.name}
              entryId={item.id}
              disabled={busy}
              compact
              onRestore={() => onRestore(item)}
            />
            <PurgeButton name={item.name} disabled={busy} compact onPurge={() => onPurge(item)} />
          </div>
        }
      />
    ))}
  </div>
);
