// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Avatar, Button, cssVar, Tag, Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { MaterialIcon } from "../../../icons/material-icon/material-icon.js";
import { detailsCardStyle } from "../../event-details/event-details-body/styles.js";
import { initialsOf } from "../../../session/initials-of.js";
import { GuestName } from "../guest-name/guest-name.js";
import { guestCardStyle, guestRowStyle, guestRowsStyle, guestsSectionStyle } from "./styles.js";
import type { GuestsSectionProps } from "./types.js";

export const GuestsSection = ({ state, nameOf, readOnly }: GuestsSectionProps) => {
  const { t } = useTranslation();
  const hidden = readOnly && state.status === "ready" && state.guests.length === 0;
  if (hidden) {
    return null;
  }

  return (
    <section
      data-testid="event-guests-section"
      style={detailsCardStyle}
      aria-labelledby="event-guests-heading"
    >
      <div style={guestRowStyle}>
        <MaterialIcon name="group" size="18px" color={cssVar("color-primary")} />
        <span id="event-guests-heading">
          <Text variant="label" textId="calendar.guests.heading" />
        </span>
        <Tag>
          <Text variant="caption" value={String(state.guests.length)} />
        </Tag>
      </div>

      {state.status === "loading" && <Text variant="body" textId="calendar.guests.loading" />}

      {state.status === "failed" && (
        <div role="alert" style={guestsSectionStyle}>
          <Text variant="error" textId="calendar.guests.loadFailed" />
          <Button type="button" variant="ghost" onClick={state.retry}>
            <Text variant="action" textId="calendar.guests.retry" />
          </Button>
        </div>
      )}

      {state.status === "ready" && state.guests.length === 0 && (
        <Text variant="body" textId="calendar.guests.emptyHost" />
      )}

      {state.status === "ready" && state.guests.length > 0 && (
        <ul style={guestRowsStyle} aria-label={t("calendar.guests.heading")}>
          {state.guests.map((guest) => {
            const name = nameOf(guest.userId);
            return (
              <li
                key={guest.userId}
                data-testid={`event-guest-${guest.userId}`}
                style={guestCardStyle}
              >
                <Avatar initials={name === undefined ? "?" : initialsOf(name)} size="2rem" />
                <GuestName name={name} />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
