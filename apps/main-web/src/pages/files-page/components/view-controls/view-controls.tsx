// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, MaterialIcon, SegmentedControl, Select, cssVar } from "@offgrid/ui";
import { FILES_SORT_FIELDS } from "../../../../files/constants.js";
import type { FilesSortField, FilesView } from "../../../../files/types.js";
import { viewControlsStyle } from "./styles.js";
import type { ViewControlsProps } from "./types.js";

const toSortField = (value: string): FilesSortField | undefined =>
  FILES_SORT_FIELDS.find((field) => field === value);

export const ViewControls = ({ view, sort, direction, onChange }: ViewControlsProps) => {
  const isAscending = direction === "asc";

  return (
    <div style={viewControlsStyle} data-testid="files-view-controls">
      <SegmentedControl<FilesView>
        labelTextId="files.view.label"
        value={view}
        onChange={(next) => onChange({ view: next })}
        options={[
          { value: "list", labelTextId: "files.view.list" },
          { value: "grid", labelTextId: "files.view.grid" },
        ]}
      />
      <Select
        labelTextId="files.sort.label"
        value={sort}
        onChange={(event) => {
          const next = toSortField(event.target.value);
          if (next !== undefined) {
            onChange({ sort: next });
          }
        }}
        options={[
          { value: "name", labelTextId: "files.sort.name" },
          { value: "modified", labelTextId: "files.sort.modified" },
          { value: "size", labelTextId: "files.sort.size" },
        ]}
        data-testid="files-sort-select"
      />
      <Button
        type="button"
        variant="secondary"
        size="icon"
        ariaLabelTextId={isAscending ? "files.sort.descending" : "files.sort.ascending"}
        onClick={() => onChange({ direction: isAscending ? "desc" : "asc" })}
        data-testid="files-sort-direction"
        data-direction={direction}
      >
        <MaterialIcon
          name={isAscending ? "arrow_upward" : "arrow_downward"}
          size="18px"
          color={cssVar("color-fg")}
        />
      </Button>
    </div>
  );
};
