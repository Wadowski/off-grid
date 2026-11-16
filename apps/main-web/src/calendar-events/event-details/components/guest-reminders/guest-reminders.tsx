// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { useState } from "react";
import { ReminderGroup } from "../../../reminder-group/reminder-group.js";
import { sameReminderOffsets } from "../../../same-reminder-offsets.js";
import { guestRemindersActionsStyle, guestRemindersStyle } from "./styles.js";
import type { GuestRemindersProps } from "./types.js";

export const GuestReminders = ({ offsets, onSave }: GuestRemindersProps) => {
  const [saved, setSaved] = useState(offsets);
  const [current, setCurrent] = useState(offsets);
  const [valid, setValid] = useState(true);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  const change = (next: readonly number[], nextValid: boolean) => {
    setCurrent(next);
    setValid(nextValid);
  };

  const save = async () => {
    setSaving(true);
    setFailed(false);
    try {
      await onSave(current);
      setSaved(current);
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={guestRemindersStyle}>
      <ReminderGroup offsets={offsets} disabled={saving} submitAttempt={0} onChange={change} />
      <div style={guestRemindersActionsStyle}>
        <Button
          type="button"
          variant="primary"
          disabled={saving || !valid || sameReminderOffsets(current, saved)}
          aria-busy={saving}
          data-testid="guest-reminders-save"
          onClick={() => void save()}
        >
          <Text
            variant="action"
            textId={
              saving
                ? "calendar.eventDetails.reminders.saving"
                : "calendar.eventDetails.reminders.save"
            }
          />
        </Button>
      </div>
      {failed && (
        <div role="alert">
          <Text variant="error" textId="calendar.eventDetails.reminders.saveFailed" />
        </div>
      )}
    </div>
  );
};
