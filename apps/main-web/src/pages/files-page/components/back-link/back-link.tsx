// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, MaterialIcon, Text } from "@offgrid/ui";
import { Link } from "react-router-dom";
import { backLinkStyle } from "./styles.js";
import type { BackLinkProps } from "./types.js";

export const BackLink = ({ to, parentName }: BackLinkProps) => (
  <Link to={to} style={backLinkStyle} data-testid="files-back-link">
    <MaterialIcon name="arrow_back" size="20px" color={cssVar("color-primary")} />
    <Text variant="label" element="span" textId="files.folder.back" values={{ name: parentName }} />
  </Link>
);
