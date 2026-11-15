// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { MAX_REMINDERS_PER_EVENT } from "@offgrid/contracts";
import { Button, cssVar, Text, VisuallyHidden } from "@offgrid/ui";
import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MaterialIcon } from "../../icons/material-icon/material-icon.js";
import { DEFAULT_REMINDER_AMOUNT, DEFAULT_REMINDER_UNIT } from "../constants.js";
import { findReminderErrors } from "../find-reminder-errors.js";
import { reminderOffsetToDraft } from "../reminder-offset-to-draft.js";
import type { ReminderDraft, ReminderUnit } from "../types.js";
import { validReminderOffsets } from "../valid-reminder-offsets.js";
import { ReminderRow } from "./components/reminder-row/reminder-row.js";
import {
  reminderAddAreaStyle,
  reminderGroupStyle,
  reminderGroupTitleStyle,
  reminderListStyle,
  reminderMutedStyle,
} from "./styles.js";
import type { ReminderAnnouncement, ReminderFocusRequest, ReminderGroupProps } from "./types.js";

const ADD_TEST_ID = "reminder-add";

const amountTestId = (index: number): string => `reminder-amount-${index}`;

export const ReminderGroup = ({
  offsets,
  disabled,
  submitAttempt,
  onChange,
}: ReminderGroupProps) => {
  const { t } = useTranslation();
  const headingId = useId();
  const limitId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [drafts, setDrafts] = useState<readonly ReminderDraft[]>(() =>
    offsets.map((minutes, index) => reminderOffsetToDraft(minutes, index)),
  );
  const nextKey = useRef(offsets.length);
  const [touched, setTouched] = useState<readonly number[]>([]);
  const [attempted, setAttempted] = useState(false);
  const [seenAttempt, setSeenAttempt] = useState(submitAttempt);
  const [focusRequest, setFocusRequest] = useState<ReminderFocusRequest | undefined>(undefined);
  const [announcement, setAnnouncement] = useState<ReminderAnnouncement | undefined>(undefined);

  const errors = findReminderErrors(drafts);

  if (submitAttempt !== seenAttempt) {
    setSeenAttempt(submitAttempt);
    setAttempted(true);
    const firstInvalid = errors.findIndex((error) => error !== undefined);
    if (firstInvalid >= 0) {
      setFocusRequest({ testId: amountTestId(firstInvalid) });
    }
  }

  useEffect(() => {
    if (focusRequest !== undefined) {
      rootRef.current
        ?.querySelector<HTMLElement>(`[data-testid="${focusRequest.testId}"]`)
        ?.focus();
    }
  }, [focusRequest]);

  const commit = (next: readonly ReminderDraft[]) => {
    setDrafts(next);
    onChange(
      validReminderOffsets(next),
      findReminderErrors(next).every((error) => error === undefined),
    );
  };

  const markTouched = (key: number) =>
    setTouched((current) => (current.includes(key) ? current : [...current, key]));

  const add = () => {
    const key = nextKey.current;
    nextKey.current += 1;
    commit([...drafts, { key, amount: DEFAULT_REMINDER_AMOUNT, unit: DEFAULT_REMINDER_UNIT }]);
    setAnnouncement("added");
    setFocusRequest({ testId: amountTestId(drafts.length) });
  };

  const remove = (index: number) => {
    const next = drafts.filter((_, position) => position !== index);
    commit(next);
    setAnnouncement("removed");
    setFocusRequest({ testId: index < next.length ? amountTestId(index) : ADD_TEST_ID });
  };

  const change = (index: number, field: { amount: string } | { unit: ReminderUnit }) => {
    const draft = drafts[index];
    if (draft === undefined) {
      return;
    }
    markTouched(draft.key);
    commit(
      drafts.map((current, position) => (position === index ? { ...current, ...field } : current)),
    );
  };

  const atLimit = drafts.length >= MAX_REMINDERS_PER_EVENT;

  return (
    <div
      ref={rootRef}
      role="group"
      aria-labelledby={headingId}
      style={reminderGroupStyle}
      data-testid="reminder-group"
    >
      <span id={headingId} style={reminderGroupTitleStyle}>
        <MaterialIcon name="notifications" size="18px" color={cssVar("color-primary")} />
        <Text variant="label" textId="calendar.eventModal.reminders.heading" />
      </span>

      {drafts.length === 0 ? (
        <div style={reminderMutedStyle}>
          <Text variant="body" textId="calendar.eventModal.reminders.empty" />
        </div>
      ) : (
        <div style={reminderListStyle}>
          {drafts.map((draft, index) => (
            <ReminderRow
              key={draft.key}
              index={index}
              total={drafts.length}
              draft={draft}
              error={attempted || touched.includes(draft.key) ? errors[index] : undefined}
              disabled={disabled}
              onAmount={(amount) => change(index, { amount })}
              onUnit={(unit) => change(index, { unit })}
              onRemove={() => remove(index)}
            />
          ))}
          <div style={reminderMutedStyle}>
            <Text variant="caption" textId="calendar.eventModal.reminders.suffix" />
          </div>
        </div>
      )}

      <div style={reminderAddAreaStyle}>
        <Button
          type="button"
          variant="ghost"
          size="small"
          disabled={disabled || atLimit}
          aria-describedby={atLimit ? limitId : undefined}
          data-testid={ADD_TEST_ID}
          onClick={add}
        >
          <MaterialIcon name="add" size="18px" color="currentColor" />
          <Text variant="action" textId="calendar.eventModal.reminders.add" />
        </Button>
        {atLimit && (
          <div id={limitId} style={reminderMutedStyle}>
            <Text variant="caption" textId="calendar.eventModal.reminders.limit" />
          </div>
        )}
      </div>

      <VisuallyHidden>
        <Text
          variant="status"
          role="status"
          value={
            announcement === undefined ? "" : t(`calendar.eventModal.reminders.${announcement}`)
          }
        />
      </VisuallyHidden>
    </div>
  );
};
