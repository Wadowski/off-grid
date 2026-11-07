// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { AccountIntroProps } from "./pages/create-account-page/components/account-intro/types.js";
import type {
  CreateAccountErrorTextId,
  CreateAccountFieldErrors,
} from "./forms/create-account-form/types.js";

export const NARROW_MEDIA_QUERY = "(max-width: 639px)";

export const API_PATH = "/api";

export const API_PORT = 3000;

export const FAMILY_HEADER = "x-offgrid-family-id";

export const SESSION_CHANNEL_NAME = "offgrid-session";

export const RENEW_BEFORE_EXPIRY_MS = 60_000;

export const FAMILY_NAME_INPUT_MAX_LENGTH = 200;

export const PASSWORD_MIN_LENGTH = 12;

export const RECOVERY_CODE_FILE_NAME = "offgrid-recovery-code.txt";

export const FIRST_FAMILY_PATH = "/welcome";

export const RECOVERY_INTRO: AccountIntroProps = {
  icon: "key",
  pillTextId: "createAccount.pill.recovery",
  headingTextId: "createAccount.recovery.heading",
  bodyTextId: "createAccount.recovery.explanation",
};

export const NO_FIELD_ERRORS: CreateAccountFieldErrors = {
  displayName: undefined,
  email: undefined,
  password: undefined,
  confirmation: undefined,
};

export const PASSWORD_ERROR_TEXT_IDS = new Map<string, CreateAccountErrorTextId>([
  ["PASSWORD_TOO_SHORT", "createAccount.passwordTooShort"],
  ["PASSWORD_TOO_LONG", "createAccount.passwordTooLong"],
  ["PASSWORD_TOO_COMMON", "createAccount.passwordTooCommon"],
  ["PASSWORD_CONTAINS_PERSONAL_DATA", "createAccount.passwordContainsPersonalData"],
]);
