// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FilterChip, MaterialIcon, Text, cssVar } from "@offgrid/ui";
import { NOTIFICATION_FILTER_OPTIONS } from "../constants.js";
import {
  notificationsFilterBarPhoneStyle,
  notificationsFilterBarStyle,
  notificationsFilterChipsPhoneStyle,
  notificationsFilterChipsStyle,
  notificationsSortStyle,
} from "./styles.js";
import { isSingleRowLayout } from "./is-single-row-layout.js";
import type { NotificationsFilterBarProps } from "./types.js";

export const NotificationsFilterBar = ({
  layout,
  selectedOption,
  totalForSelected,
  onSelect,
}: NotificationsFilterBarProps) => (
  <div
    style={
      isSingleRowLayout(layout) ? notificationsFilterBarPhoneStyle : notificationsFilterBarStyle
    }
    data-testid="notifications-filter-bar"
  >
    <div
      style={
        isSingleRowLayout(layout)
          ? notificationsFilterChipsPhoneStyle
          : notificationsFilterChipsStyle
      }
    >
      {NOTIFICATION_FILTER_OPTIONS.map((definition) => {
        const isSelected = definition.id === selectedOption;
        return (
          <FilterChip
            key={definition.id}
            label={<Text element="span" variant="label" textId={definition.labelId} />}
            selected={isSelected}
            count={isSelected ? totalForSelected : undefined}
            onToggle={() => {
              if (!isSelected) {
                onSelect(definition.id);
              }
            }}
            data-testid={`notifications-filter-${definition.id}`}
          />
        );
      })}
    </div>
    {layout === "desktop" ? (
      <span style={notificationsSortStyle}>
        <MaterialIcon name="swap_vert" size="1rem" color={cssVar("color-muted")} />
        <Text element="span" variant="caption" textId="notifications.page.sortNewest" />
      </span>
    ) : null}
  </div>
);
