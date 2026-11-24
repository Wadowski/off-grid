// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const createAbortError = (): DOMException =>
  new DOMException("The upload was aborted.", "AbortError");
