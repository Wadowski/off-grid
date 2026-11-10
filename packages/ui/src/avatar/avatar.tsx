// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { avatarStyle } from "./styles.js";
import type { AvatarProps } from "./types.js";

export const Avatar = ({ initials, size = "2.5rem" }: AvatarProps) => (
  <span aria-hidden="true" style={avatarStyle(size)}>
    {initials}
  </span>
);
