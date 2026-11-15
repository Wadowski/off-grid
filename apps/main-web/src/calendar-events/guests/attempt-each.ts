// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const attemptEach = async (
  userIds: readonly string[],
  action: (userId: string) => Promise<void>,
): Promise<readonly string[]> => {
  const failed: string[] = [];
  for (const userId of userIds) {
    try {
      await action(userId);
    } catch {
      failed.push(userId);
    }
  }
  return failed;
};
