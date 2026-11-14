// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, IconTile } from "@offgrid/ui";
import { MaterialIcon } from "../../../../icons/material-icon/material-icon.js";
import { newEventIconTileBackground } from "../../styles.js";
import {
  newEventHeaderActionsStyle,
  newEventHeaderStyle,
  newEventTitleGroupStyle,
} from "./styles.js";
import type { NewEventHeaderProps } from "./types.js";

export const NewEventHeader = ({
  narrow,
  heading,
  cancelButton,
  createButton,
  calendarPicker,
  closeButton,
}: NewEventHeaderProps) => (
  <header style={newEventHeaderStyle}>
    {narrow ? (
      <>
        {cancelButton}
        {heading}
        {createButton}
      </>
    ) : (
      <>
        <div style={newEventTitleGroupStyle}>
          <IconTile
            size="2rem"
            shape="rounded"
            background={newEventIconTileBackground}
            color={cssVar("color-primary")}
          >
            <MaterialIcon name="event_note" size="19px" color="currentColor" />
          </IconTile>
          {heading}
        </div>
        <div style={newEventHeaderActionsStyle}>
          {calendarPicker}
          {closeButton}
        </div>
      </>
    )}
  </header>
);
