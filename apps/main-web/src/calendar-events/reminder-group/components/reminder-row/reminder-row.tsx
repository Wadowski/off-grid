// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Select, Text, TextField, VisuallyHidden } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { useIsNarrow } from "../../../../media/use-is-narrow.js";
import { MaterialIcon } from "../../../../icons/material-icon/material-icon.js";
import {
  REMINDER_ERROR_TEXT_IDS,
  REMINDER_UNIT_TEXT_IDS,
  REMINDER_UNITS,
} from "../../../constants.js";
import {
  reminderAmountCellStyle,
  reminderRemoveCellStyle,
  reminderSuffixCellStyle,
  reminderRowControlsStyle,
  reminderRowStyle,
  reminderUnitCellStyle,
  reminderZeroHelperStyle,
} from "./styles.js";
import type { ReminderRowProps } from "./types.js";

const PLURAL_COUNT = 2;

export const ReminderRow = ({
  index,
  total,
  draft,
  error,
  disabled,
  onAmount,
  onUnit,
  onRemove,
}: ReminderRowProps) => {
  const { t } = useTranslation();
  const narrow = useIsNarrow();
  const amount = Number(draft.amount);
  const count = draft.amount.trim() !== "" && Number.isFinite(amount) ? amount : PLURAL_COUNT;
  const unitOptions = REMINDER_UNITS.map((unit) => ({
    value: unit,
    label: t(REMINDER_UNIT_TEXT_IDS[unit], { count }),
  }));
  const rowLabel = t("calendar.eventModal.reminders.rowLabel", {
    position: index + 1,
    total,
  });

  return (
    <div
      role="group"
      aria-label={rowLabel}
      style={reminderRowStyle}
      data-testid={`reminder-row-${index}`}
    >
      <div style={reminderRowControlsStyle}>
        <div style={reminderAmountCellStyle}>
          <TextField
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            data-testid={`reminder-amount-${index}`}
            label={
              <VisuallyHidden>
                <Text variant="label" textId="calendar.eventModal.reminders.amountLabel" />
              </VisuallyHidden>
            }
            value={draft.amount}
            disabled={disabled}
            onChange={(event) => onAmount(event.target.value)}
            error={
              error === undefined ? undefined : (
                <Text variant="error" textId={REMINDER_ERROR_TEXT_IDS[error]} />
              )
            }
          />
        </div>
        <div style={reminderUnitCellStyle}>
          <Select
            labelTextId="calendar.eventModal.reminders.unitLabel"
            data-testid={`reminder-unit-${index}`}
            variant="field"
            value={draft.unit}
            disabled={disabled}
            onChange={(event) => {
              const unit = REMINDER_UNITS.find((candidate) => candidate === event.target.value);
              if (unit !== undefined) {
                onUnit(unit);
              }
            }}
            options={unitOptions}
          />
        </div>
        {!narrow && (
          <div style={reminderSuffixCellStyle(narrow)}>
            <Text variant="caption" textId="calendar.eventModal.reminders.suffix" />
          </div>
        )}
        <div style={reminderRemoveCellStyle(narrow)}>
          <Button
            type="button"
            variant="ghost"
            size="medium"
            disabled={disabled}
            aria-label={t("calendar.eventModal.reminders.remove")}
            data-testid={`reminder-remove-${index}`}
            onClick={onRemove}
          >
            <MaterialIcon name="close" size="18px" color="currentColor" />
          </Button>
        </div>
      </div>
      {error === undefined && draft.amount.trim() === "0" && (
        <div style={reminderZeroHelperStyle}>
          <Text variant="caption" textId="calendar.eventModal.reminders.zeroHelper" />
        </div>
      )}
    </div>
  );
};
