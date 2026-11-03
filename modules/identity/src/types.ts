// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CurrentUserId } from "@offgrid/http";
import type { ModuleDatabase } from "@offgrid/db";
import type { Logger } from "@offgrid/observability";
import type { ACCOUNT_STATUSES, INSTANCE_ROLES } from "./constants.js";

export type InstanceRole = (typeof INSTANCE_ROLES)[number];

export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export interface CreateUserInput {
  readonly email: string;
  readonly displayName: string;
  readonly passwordHash: string;
  readonly recoveryCodeHash: string;
}

export interface NewUser {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly instanceRole: InstanceRole;
}

export interface UserRecord {
  readonly userId: string;
  readonly email: string;
  readonly displayName: string;
  readonly instanceRole: string;
  readonly status: string;
  readonly createdAt: Date;
}

export interface User {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly instanceRole: InstanceRole;
  readonly status: AccountStatus;
  readonly createdAt: string;
}

export interface AccountSnapshot {
  readonly userId: string;
  readonly instanceRole: InstanceRole;
  readonly status: AccountStatus;
}

export interface InstanceSettings {
  readonly registrationOpen: boolean;
}

export interface NewRecoveryCode {
  readonly id: string;
  readonly userId: string;
  readonly codeHash: string;
}

export interface NewSession {
  readonly id: string;
  readonly userId: string;
  readonly deviceLabel: string | null;
  readonly expiresAt: Date;
  readonly refreshTokenHash: string;
  readonly accessTokenHash: string;
  readonly accessExpiresAt: Date;
}

export interface SessionTokenUpdate {
  readonly refreshTokenHash?: string;
  readonly previousRefreshTokenHash?: string;
  readonly rotatedAt?: Date;
  readonly accessTokenHash: string;
  readonly accessExpiresAt: Date;
}

export type PasswordProblem =
  | "PASSWORD_TOO_SHORT"
  | "PASSWORD_TOO_LONG"
  | "PASSWORD_TOO_COMMON"
  | "PASSWORD_CONTAINS_PERSONAL_DATA";

export interface RegisterAccountInput {
  readonly email: string;
  readonly displayName: string;
  readonly password: string;
}

export interface IssuedSession {
  readonly refreshToken: string;
  readonly expiresAt: Date;
  readonly accessToken: string;
  readonly accessExpiresAt: Date;
}

export interface IssueSessionOptions {
  readonly deviceLabel?: string | null;
  readonly lifetimeMs?: number;
}

export interface SignInAttemptState {
  failures: number;
  lockedUntil: number;
}

export interface SignInInput {
  readonly email: string;
  readonly password: string;
  readonly rememberMe?: boolean;
  readonly deviceLabel?: string;
}

export interface AccountForSignIn {
  readonly userId: string;
  readonly email: string;
  readonly displayName: string;
  readonly instanceRole: InstanceRole;
  readonly status: AccountStatus;
  readonly passwordHash: string;
}

export interface SessionLookup {
  readonly sessionId: string;
  readonly userId: string;
  readonly expiresAt: Date;
  readonly revoked: boolean;
  readonly rotatedAt: Date | null;
  readonly matchedCurrent: boolean;
  readonly accountStatus: AccountStatus;
}

export interface SignedInSession {
  readonly user: SignedInUser;
  readonly accessToken: string;
  readonly accessExpiresAt: Date;
  readonly refreshToken: string;
  readonly sessionExpiresAt: Date;
}

export interface SignedInUser {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly instanceRole: InstanceRole;
}

export interface RenewedSession {
  readonly accessToken: string;
  readonly accessExpiresAt: Date;
  readonly refreshToken: string | null;
  readonly sessionExpiresAt: Date;
}

export interface RegisteredAccount {
  readonly user: User;
  readonly recoveryCode: string;
  readonly refreshToken: string;
  readonly sessionExpiresAt: Date;
}

export interface RegistrationStatus {
  readonly freshServer: boolean;
  readonly registrationOpen: boolean;
}

export interface UserCreatedInput {
  readonly userId: string;
  readonly displayName: string;
}

export interface IdentityRouteContext {
  readonly db: ModuleDatabase;
  readonly currentUserId: CurrentUserId;
  readonly logger: Logger;
}

export interface VerifiedAccessToken {
  readonly userId: string;
  readonly sessionId: string;
}

export interface IssuedPasswordReset {
  readonly userId: string;
  readonly code: string;
  readonly expiresAt: Date;
}

export interface NewPasswordReset {
  readonly id: string;
  readonly userId: string;
  readonly codeHash: string;
  readonly expiresAt: Date;
}

export interface PasswordResetRecord {
  readonly passwordResetId: string;
  readonly userId: string;
  readonly expiresAt: Date;
  readonly usedAt: Date | null;
  readonly retiredAt: Date | null;
}

export interface CompletePasswordResetInput {
  readonly code: string;
  readonly password: string;
}

export interface CreateRecoveryAdminInput {
  readonly email: string;
  readonly displayName: string;
}
