// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const toToggledExpandedIds = (
  expandedIds: ReadonlySet<string>,
  id: string,
): ReadonlySet<string> => {
  const next = new Set(expandedIds);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  return next;
};
