// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { MaterialIcon, cssVar } from "@offgrid/ui";
import { useId } from "react";
import { useTranslation } from "react-i18next";
import { FILES_SORT_FIELDS } from "../../../../files/constants.js";
import type { FilesSortField, FilesView } from "../../../../files/types.js";
import {
  sortChevronStyle,
  sortDirectionStyle,
  sortDividerStyle,
  sortLabelStyle,
  sortSelectStyle,
  sortTriggerStyle,
  viewControlsStyle,
  viewToggleOptionStyle,
  viewToggleStyle,
} from "./styles.js";
import type { ViewControlsProps } from "./types.js";

const toSortField = (value: string): FilesSortField | undefined =>
  FILES_SORT_FIELDS.find((field) => field === value);

const VIEW_OPTIONS = [
  { value: "grid", icon: "grid_view", labelTextId: "files.view.grid" },
  { value: "list", icon: "view_list", labelTextId: "files.view.list" },
] as const satisfies readonly {
  readonly value: FilesView;
  readonly icon: string;
  readonly labelTextId: "files.view.grid" | "files.view.list";
}[];

const SORT_OPTIONS = [
  { value: "name", labelTextId: "files.sort.name" },
  { value: "modified", labelTextId: "files.sort.modified" },
  { value: "size", labelTextId: "files.sort.size" },
] as const satisfies readonly {
  readonly value: FilesSortField;
  readonly labelTextId: "files.sort.name" | "files.sort.modified" | "files.sort.size";
}[];

export const ViewControls = ({ view, sort, direction, onChange }: ViewControlsProps) => {
  const { t } = useTranslation();
  const sortId = useId();
  const isAscending = direction === "asc";
  const directionTextId = isAscending ? "files.sort.descending" : "files.sort.ascending";

  return (
    <div style={viewControlsStyle} data-testid="files-view-controls">
      <div role="group" aria-label={t("files.view.label")} style={viewToggleStyle}>
        {VIEW_OPTIONS.map((option) => {
          const selected = option.value === view;
          const label = t(option.labelTextId);
          return (
            <button
              key={option.value}
              type="button"
              className="og-focusable"
              aria-label={label}
              aria-pressed={selected}
              title={label}
              data-testid={`segmented-option-${option.value}`}
              style={viewToggleOptionStyle(selected)}
              onClick={() => onChange({ view: option.value })}
            >
              <MaterialIcon
                name={option.icon}
                size="18px"
                color={selected ? cssVar("color-fg") : cssVar("color-outline")}
              />
            </button>
          );
        })}
      </div>
      <div style={sortTriggerStyle}>
        <MaterialIcon name="sort" size="16px" color={cssVar("color-outline")} />
        <label htmlFor={sortId} style={sortLabelStyle}>
          {t("files.sort.label")}
        </label>
        <select
          id={sortId}
          className="og-focusable"
          style={sortSelectStyle}
          value={sort}
          onChange={(event) => {
            const next = toSortField(event.target.value);
            if (next !== undefined) {
              onChange({ sort: next });
            }
          }}
          data-testid="files-sort-select"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.labelTextId)}
            </option>
          ))}
        </select>
        <span aria-hidden="true" style={sortChevronStyle}>
          <MaterialIcon name="arrow_drop_down" size="18px" color={cssVar("color-outline")} />
        </span>
        <span aria-hidden="true" style={sortDividerStyle} />
        <button
          type="button"
          className="og-focusable"
          aria-label={t(directionTextId)}
          title={t(directionTextId)}
          onClick={() => onChange({ direction: isAscending ? "desc" : "asc" })}
          data-testid="files-sort-direction"
          data-direction={direction}
          style={sortDirectionStyle}
        >
          <MaterialIcon
            name={isAscending ? "arrow_upward" : "arrow_downward"}
            size="16px"
            color={cssVar("color-fg")}
          />
        </button>
      </div>
    </div>
  );
};
