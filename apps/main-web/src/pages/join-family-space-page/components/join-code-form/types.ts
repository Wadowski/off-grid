// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { JoinErrorTextId } from "../../types.js";

export type JoinCodeFormProps = {
  readonly submitting: boolean;
  readonly errorTextId: JoinErrorTextId | undefined;
  readonly onSubmit: (code: string) => Promise<void>;
};
