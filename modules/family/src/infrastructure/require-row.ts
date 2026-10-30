// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const requireRow = <Row>(rows: readonly Row[]): Row => {
  const [row] = rows;
  if (row === undefined) {
    throw new Error("insert returned no row");
  }
  return row;
};
