// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const focusSelectedRow = (container: HTMLElement | null): void => {
  container?.querySelector<HTMLElement>('[aria-current="true"]')?.focus();
};
