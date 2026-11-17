// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, cssVar, MaterialIcon, Tag, Text, VisuallyHidden } from "@offgrid/ui";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { GuestName } from "../guest-name/guest-name.js";
import { guestNameOf } from "../guest-names.js";
import { CandidateOptions } from "./components/candidate-options/candidate-options.js";
import { guestChipStyle, guestChipsStyle, guestFieldStyle } from "./styles.js";
import type { GuestFieldProps } from "./types.js";

const nameOrUnknown = (name: string | undefined, unknownName: string): string =>
  name ?? unknownName;

export const GuestField = ({
  selectedIds,
  candidatesState,
  disabled,
  onToggle,
}: GuestFieldProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const candidates = candidatesState.candidates;

  const chipLabel = (userId: string) =>
    nameOrUnknown(guestNameOf(candidates, userId), t("calendar.guests.unknownName"));

  return (
    <div data-testid="guest-field" style={guestFieldStyle}>
      <div>
        <MaterialIcon name="group" size="18px" color={cssVar("color-primary")} />
        <Text variant="label" textId="calendar.guests.heading" />
        <Tag>
          <Text
            variant="caption"
            textId="calendar.guests.selectedCount"
            values={{ count: selectedIds.length }}
          />
        </Tag>
      </div>

      {disabled && <Text variant="body" textId="calendar.guests.familyHint" />}

      {!disabled && (
        <div style={guestChipsStyle}>
          {selectedIds.map((userId) => (
            <span key={userId} data-testid={`guest-chip-${userId}`} style={guestChipStyle}>
              <GuestName name={guestNameOf(candidates, userId)} />
              <Button
                type="button"
                variant="ghost"
                size="small"
                data-testid={`guest-chip-remove-${userId}`}
                onClick={() => onToggle(userId)}
              >
                <MaterialIcon name="close" size="16px" color="currentColor" />
                <VisuallyHidden>
                  <Text
                    variant="action"
                    textId="calendar.guests.remove"
                    values={{ name: chipLabel(userId) }}
                  />
                </VisuallyHidden>
              </Button>
            </span>
          ))}
        </div>
      )}

      {!disabled && candidatesState.status === "loading" && (
        <Text variant="body" textId="calendar.guests.loading" />
      )}

      {!disabled && candidatesState.status === "failed" && (
        <div role="alert">
          <Text variant="error" textId="calendar.guests.loadFailed" />
          <Button type="button" variant="ghost" onClick={candidatesState.retry}>
            <Text variant="action" textId="calendar.guests.retry" />
          </Button>
        </div>
      )}

      {!disabled && candidatesState.status === "ready" && candidates.length === 0 && (
        <Text variant="body" textId="calendar.guests.noCandidates" />
      )}

      {!disabled && candidatesState.status === "ready" && candidates.length > 0 && (
        <>
          <Button
            type="button"
            variant="ghost"
            data-testid="guest-field-add"
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
          >
            <Text variant="action" textId="calendar.guests.add" />
          </Button>
          {open && (
            <CandidateOptions
              candidates={candidates}
              selectedIds={selectedIds}
              onToggle={onToggle}
            />
          )}
        </>
      )}
    </div>
  );
};
