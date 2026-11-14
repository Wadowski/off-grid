// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, Checkbox, Text, TextField, Textarea, VisuallyHidden } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { MaterialIcon } from "../../../../icons/material-icon/material-icon.js";
import { DateTimeBlock } from "../date-time-block/date-time-block.js";
import {
  newEventColumnStyle,
  newEventGroupHeadStyle,
  newEventGroupStyle,
  newEventGroupTitleStyle,
  newEventLabelRowStyle,
  newEventTimeErrorStyle,
  newEventTimesStyle,
  newEventTitleCardStyle,
  newEventZoneStyle,
} from "./styles.js";
import type { NewEventFieldsProps } from "./types.js";

export const NewEventFields = ({
  values,
  errors,
  timeZone,
  narrow,
  calendarPicker,
  update,
}: NewEventFieldsProps) => {
  const { t } = useTranslation();

  return (
    <>
      {narrow && (
        <div style={newEventGroupStyle}>
          <div style={newEventColumnStyle}>
            <Text variant="label" textId="calendar.event.calendar" />
            {calendarPicker}
          </div>
        </div>
      )}

      <div style={newEventTitleCardStyle}>
        <TextField
          variant="title"
          label={<Text variant="label" textId="calendar.event.title" />}
          placeholder={t("calendar.eventModal.titlePlaceholder")}
          value={values.title}
          onChange={(event) => update("title", event.target.value)}
          error={
            errors.title === undefined ? undefined : (
              <Text
                variant="error"
                textId={
                  errors.title === "titleTooLong"
                    ? "calendar.eventModal.titleTooLong"
                    : "calendar.eventModal.titleRequired"
                }
              />
            )
          }
        />
      </div>

      <div style={newEventGroupStyle}>
        <div style={newEventGroupHeadStyle}>
          <span style={newEventGroupTitleStyle}>
            <MaterialIcon name="schedule" size="18px" color={cssVar("color-primary")} />
            <Text variant="label" textId="calendar.eventModal.timeAndDuration" />
          </span>
          <Checkbox
            variant="switch"
            label={<Text variant="label" textId="calendar.eventModal.allDay" />}
            checked={values.isAllDay}
            onChange={(event) => update("isAllDay", event.target.checked)}
          />
        </div>

        <div style={newEventTimesStyle}>
          <DateTimeBlock
            caption={<Text variant="label" textId="calendar.eventModal.starts" />}
            dateLabel={
              <VisuallyHidden>
                <Text variant="label" textId="calendar.eventModal.startDate" />
              </VisuallyHidden>
            }
            timeLabel={
              <VisuallyHidden>
                <Text variant="label" textId="calendar.eventModal.startTime" />
              </VisuallyHidden>
            }
            date={values.startDate}
            time={values.startTime}
            showTime={!values.isAllDay}
            onDate={(value) => update("startDate", value)}
            onTime={(value) => update("startTime", value)}
          />
          <DateTimeBlock
            caption={<Text variant="label" textId="calendar.eventModal.ends" />}
            dateLabel={
              <VisuallyHidden>
                <Text variant="label" textId="calendar.eventModal.endDate" />
              </VisuallyHidden>
            }
            timeLabel={
              <VisuallyHidden>
                <Text variant="label" textId="calendar.eventModal.endTime" />
              </VisuallyHidden>
            }
            date={values.endDate}
            time={values.endTime}
            showTime={!values.isAllDay}
            onDate={(value) => update("endDate", value)}
            onTime={(value) => update("endTime", value)}
          />
        </div>

        {errors.end === "endsBeforeStart" && (
          <div role="alert" style={newEventTimeErrorStyle}>
            <Text variant="error" textId="calendar.eventModal.endsBeforeStart" />
          </div>
        )}

        <div style={newEventZoneStyle}>
          <MaterialIcon name="public" size="15px" color={cssVar("color-muted")} />
          <Text variant="label" textId="calendar.eventModal.timeZone" />
          <Text variant="body" value={timeZone} />
        </div>
      </div>

      <div style={newEventGroupStyle}>
        <TextField
          label={
            <span style={newEventLabelRowStyle}>
              <MaterialIcon name="location_on" size="16px" color={cssVar("color-primary")} />
              <Text variant="label" textId="calendar.eventModal.location" />
            </span>
          }
          placeholder={t("calendar.eventModal.locationPlaceholder")}
          value={values.location}
          onChange={(event) => update("location", event.target.value)}
        />
        <Textarea
          label={
            <span style={newEventLabelRowStyle}>
              <MaterialIcon name="notes" size="16px" color={cssVar("color-primary")} />
              <Text variant="label" textId="calendar.eventModal.description" />
            </span>
          }
          placeholder={t("calendar.eventModal.descriptionPlaceholder")}
          value={values.description}
          onChange={(event) => update("description", event.target.value)}
        />
      </div>
    </>
  );
};
