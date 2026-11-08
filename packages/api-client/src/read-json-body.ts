// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const readJsonBody = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  return text.length === 0 ? undefined : JSON.parse(text);
};
