// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type FolderLoadingLayout = "table" | "grid" | "phone";

export type FolderLoadingProps = {
  readonly layout: FolderLoadingLayout;
};
