// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Avatar, Button, cssVar, Tag, Text } from "@offgrid/ui";
import { useState } from "react";
import { MaterialIcon } from "../../../icons/material-icon/material-icon.js";
import { detailsCardStyle } from "../../event-details/event-details-body/styles.js";
import { initialsOf } from "../../../session/initials-of.js";
import {
  guestCardStyle,
  guestRowsStyle,
  guestRowStyle,
  guestsSectionStyle,
} from "../guests-section/styles.js";
import { GuestName } from "../guest-name/guest-name.js";
import type { FamilyMembersSectionProps } from "./types.js";

export const FamilyMembersSection = ({ state, familyId }: FamilyMembersSectionProps) => {
  const [open, setOpen] = useState(false);
  const members = state.candidates.filter((candidate) => candidate.familyId === familyId);

  return (
    <section data-testid="event-family-section" style={detailsCardStyle}>
      {state.status === "loading" && <Text variant="body" textId="calendar.guests.loading" />}

      {state.status === "failed" && (
        <div role="alert" style={guestsSectionStyle}>
          <Text variant="error" textId="calendar.guests.loadFailed" />
          <Button type="button" variant="ghost" onClick={state.retry}>
            <Text variant="action" textId="calendar.guests.retry" />
          </Button>
        </div>
      )}

      {state.status === "ready" && (
        <>
          <Button
            type="button"
            variant="ghost"
            align="start"
            fullWidth
            data-testid="event-family-toggle"
            aria-expanded={open}
            aria-controls="event-family-members"
            onClick={() => setOpen((current) => !current)}
          >
            <span style={guestRowStyle}>
              <MaterialIcon name="group" size="18px" color={cssVar("color-primary")} />
              {members[0] === undefined ? (
                <Text variant="label" textId="calendar.guests.familyHeading" />
              ) : (
                <Text variant="label" value={members[0].familyName} />
              )}
              <Tag>
                <Text variant="caption" value={String(members.length)} />
              </Tag>
              <MaterialIcon
                name={open ? "expand_less" : "expand_more"}
                size="18px"
                color="currentColor"
              />
            </span>
          </Button>

          {open && (
            <ul id="event-family-members" data-testid="event-family-members" style={guestRowsStyle}>
              {members.map((member) => (
                <li
                  key={member.userId}
                  data-testid={`event-family-member-${member.userId}`}
                  style={guestCardStyle}
                >
                  <Avatar
                    initials={member.name === undefined ? "?" : initialsOf(member.name)}
                    size="2rem"
                  />
                  <GuestName name={member.name} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
};
