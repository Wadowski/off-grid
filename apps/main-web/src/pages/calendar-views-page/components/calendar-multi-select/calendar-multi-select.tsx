// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Checkbox, Text } from "@offgrid/ui";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import type { HiddenCalendars } from "../../../../calendar-views/events-by-calendar.js";
import { calendarAccentColor } from "../../../../calendars/calendar-accents.js";
import {
  calendarMultiSelectDotStyle,
  calendarMultiSelectPanelStyle,
  calendarMultiSelectStyle,
  calendarMultiSelectTriggerStyle,
} from "./styles.js";
import type { CalendarMultiSelectProps } from "./types.js";

// A disclosure button with a checkbox group: each calendar can be ticked on or off, and the
// keyboard works through the native checkboxes. Escape or a click outside closes the panel.
export const CalendarMultiSelect = ({ calendars, hidden, onChange }: CalendarMultiSelectProps) => {
  const { t } = useTranslation();
  const panelId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const label = t("calendar.mobileViews.calendarFilter");
  const selectedCount = calendars.filter((calendar) => !hidden.has(calendar.id)).length;
  const summary =
    hidden.size === 0
      ? t("calendar.mobileViews.allCalendars")
      : selectedCount === 0
        ? t("calendar.mobileViews.noCalendarsSelected")
        : t("calendar.mobileViews.calendarsSelected", {
            selected: selectedCount,
            total: calendars.length,
          });

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePress);
  }, [open]);

  const toggleCalendar = (calendarId: string, visible: boolean) => {
    const next = new Set(hidden);
    if (visible) {
      next.delete(calendarId);
    } else {
      next.add(calendarId);
    }
    onChange(next as HiddenCalendars);
  };

  const closeOnEscape = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && open) {
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  return (
    <div ref={containerRef} style={calendarMultiSelectStyle} onKeyDown={closeOnEscape}>
      <button
        ref={triggerRef}
        type="button"
        className="og-focusable"
        aria-label={t("calendar.mobileViews.calendarFilterSummary", { summary })}
        aria-expanded={open}
        aria-controls={panelId}
        data-testid="calendar-filter-trigger"
        style={calendarMultiSelectTriggerStyle}
        onClick={() => setOpen((current) => !current)}
      >
        <Text variant="action" value={summary} />
      </button>
      {open && (
        <div
          id={panelId}
          role="group"
          aria-label={label}
          data-testid="calendar-filter-panel"
          style={calendarMultiSelectPanelStyle}
        >
          {calendars.map((calendar) => (
            <Checkbox
              key={calendar.id}
              label={
                <>
                  <span
                    aria-hidden="true"
                    style={calendarMultiSelectDotStyle(
                      calendarAccentColor(calendar.color).background,
                    )}
                  />
                  {calendar.name}
                </>
              }
              checked={!hidden.has(calendar.id)}
              onChange={(event) => toggleCalendar(calendar.id, event.target.checked)}
              data-testid={`calendar-filter-${calendar.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
