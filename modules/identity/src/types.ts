// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CurrentUserId } from "@offgrid/http";
import type { ModuleDatabase } from "@offgrid/db";
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
}
