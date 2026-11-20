// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type UpdateActionsRowProps = {
  readonly isFirst: boolean;
  readonly checking: boolean;
  readonly canCheck: boolean;
  readonly canUpdate: boolean;
  readonly onCheck: () => void;
  readonly onUpdate: () => void;
};
