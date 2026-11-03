// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export { identityModule } from "./identity-module.js";
export { verifyAccessToken } from "./application/sessions/verify-access-token.js";
export { getOwnProfile } from "./application/account/get-own-profile.js";
export { createRecoveryAdmin } from "./application/registration/create-recovery-admin.js";
export { resetAdminPasswordByEmail } from "./application/password-reset/reset-admin-password-by-email.js";
export type { IssuedPasswordReset } from "./types.js";
