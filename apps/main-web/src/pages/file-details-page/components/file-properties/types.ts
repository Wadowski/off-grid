// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReactNode } from "react";

export type PropertyLabelTextId =
  | "files.details.type"
  | "files.details.size"
  | "files.details.location"
  | "files.details.modified"
  | "files.details.created"
  | "files.details.version";

export type PropertyRowData = {
  readonly key: string;
  readonly labelTextId: PropertyLabelTextId;
  readonly value: ReactNode;
};

export type FilePropertiesProps = {
  readonly rows: readonly PropertyRowData[];
};
