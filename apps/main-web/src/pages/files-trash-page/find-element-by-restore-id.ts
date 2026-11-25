// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const findElementByRestoreId = (
  container: HTMLElement | null,
  restoreId: string,
): HTMLElement | undefined =>
  Array.from(container?.querySelectorAll<HTMLElement>("[data-restore-id]") ?? []).find(
    (element) => element.dataset.restoreId === restoreId,
  );
