// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReactNode } from "react";
import type { Breadcrumb, RegularFileEntry } from "../../../../../../files/types.js";
import type { PropertyLabelTextId } from "../../../../../file-details-page/components/file-properties/types.js";

export type FileDetailsPanelBodyProps = {
  readonly file: RegularFileEntry;
  readonly breadcrumbs: readonly Breadcrumb[];
  readonly versionsSection: ReactNode;
};

export type PropertyRow = {
  readonly key: string;
  readonly labelTextId: PropertyLabelTextId;
  readonly value: ReactNode;
};
