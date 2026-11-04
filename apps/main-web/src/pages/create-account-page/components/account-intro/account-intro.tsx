// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { MaterialIcon } from "../../../../icons/material-icon/material-icon.js";
import { useIsNarrow } from "../../../../media/use-is-narrow.js";
import {
  accountIntroStyle,
  badgeStyle,
  iconBlockStyle,
  iconWrapStyle,
  introBodyStyle,
  introHeadingStyle,
  pillDotStyle,
  pillStyle,
} from "./styles.js";
import type { AccountIntroProps } from "./types.js";

export const AccountIntro = ({
  icon,
  pillTextId,
  headingTextId,
  bodyTextId,
}: AccountIntroProps) => {
  const narrow = useIsNarrow();

  return (
    <div style={accountIntroStyle(narrow)}>
      {!narrow && (
        <>
          <div style={iconWrapStyle}>
            <div style={iconBlockStyle}>
              <MaterialIcon name={icon} size="30px" color="var(--og-color-primary)" filled />
            </div>
            <div style={badgeStyle}>
              <MaterialIcon name="shield_lock" size="13px" color="var(--og-color-on-secondary)" />
            </div>
          </div>
          <div style={pillStyle}>
            <span style={pillDotStyle} />
            <Text variant="caption" textId={pillTextId} />
          </div>
        </>
      )}
      <div style={introHeadingStyle}>
        <Text variant="heading" textId={headingTextId} />
      </div>
      <div style={introBodyStyle(narrow)}>
        <Text variant="body" textId={bodyTextId} />
      </div>
    </div>
  );
};
