// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

// Violates identity-internals-private: reaches into identity credential code.
import { insertCredential } from "../../../identity/src/infrastructure/insert-credential.js";

export const readCredential = (userId: string): string => insertCredential(userId, "");
