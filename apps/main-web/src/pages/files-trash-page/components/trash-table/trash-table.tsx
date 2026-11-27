// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FileTable, FileTableRow } from "@offgrid/ui";
import { toTrashRowValues } from "../../../../files/to-trash-row-values.js";
import { trashRowActionsStyle } from "../../styles.js";
import { PurgeButton } from "../purge-button/purge-button.js";
import { RestoreButton } from "../restore-button/restore-button.js";
import type { TrashTableProps } from "./types.js";

export const TrashTable = ({ items, busy, onRestore, onPurge }: TrashTableProps) => (
  <div data-testid="trash-list">
    <FileTable isBusy={false} variant="trash">
      {items.map((item) => (
        <FileTableRow
          key={item.id}
          variant="trash"
          {...toTrashRowValues(item)}
          actions={
            <div style={trashRowActionsStyle}>
              <RestoreButton
                name={item.name}
                entryId={item.id}
                disabled={busy}
                compact={false}
                onRestore={() => onRestore(item)}
              />
              <PurgeButton
                name={item.name}
                disabled={busy}
                compact={false}
                onPurge={() => onPurge(item)}
              />
            </div>
          }
        />
      ))}
    </FileTable>
  </div>
);
