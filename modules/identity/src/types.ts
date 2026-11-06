// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CurrentUserId } from "@offgrid/http";
import type { FastifyRequest } from "fastify";
import type {
  MailProvider,
  MailSecurity,
  NOTIFICATION_TYPES,
  mailSettingsRequestSchema,
  mailSettingsSchema,
} from "@offgrid/contracts";
import type { z } from "zod";
import type { ModuleDatabase } from "@offgrid/db";
import type { Logger } from "@offgrid/observability";
import type { ACCOUNT_STATUSES, INSTANCE_ROLES, MAIL_FAILURE_MESSAGES } from "./constants.js";

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

export type AttemptKind = "sign-in" | "recovery" | "email-code-request";

export interface AttemptPolicy {
  readonly limit: number;
  readonly lockoutMs: number;
}

export interface AttemptCounterRecord {
  readonly failures: number;
  readonly lockedUntil: Date | null;
  readonly requestedAt: Date | null;
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
  readonly currentSessionId: (request: FastifyRequest) => string | null;
  readonly logger: Logger;
  readonly mailEncryptionKey: Buffer;
  readonly notificationChannels: readonly NotificationChannel[];
  readonly emailDependencies: EmailChannelDependencies;
}

export interface IdentityModuleOptions {
  readonly mailEncryptionKey: Buffer;
}

export type IdentityRouteInput = Omit<
  IdentityRouteContext,
  "mailEncryptionKey" | "notificationChannels" | "emailDependencies"
>;

export type MailSettingsRequest = z.infer<typeof mailSettingsRequestSchema>;

export type MailSettingsView = z.infer<typeof mailSettingsSchema>;

export interface MailSettingsRecord {
  readonly provider: MailProvider;
  readonly fromAddress: string;
  readonly smtpHost: string;
  readonly smtpPort: number;
  readonly smtpSecurity: MailSecurity;
  readonly username: string;
  readonly passwordSealed: string;
}

export interface MailConnection {
  readonly host: string;
  readonly port: number;
  readonly security: MailSecurity;
  readonly username: string;
  readonly password: string;
  readonly fromAddress: string;
}

export interface MailMessage {
  readonly to: string;
  readonly from: string;
  readonly subject: string;
  readonly text: string;
}

export type MailSender = (connection: MailConnection, message: MailMessage) => Promise<void>;

export type MailFailureReason = keyof typeof MAIL_FAILURE_MESSAGES;

export interface EmailChannelDependencies {
  readonly db: ModuleDatabase;
  readonly encryptionKey: Buffer;
  readonly logger: Logger;
  readonly sendMail: MailSender;
  readonly retryDelaysMs: readonly number[];
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

export interface RecoverWithRecoveryCodeInput {
  readonly email: string;
  readonly recoveryCode: string;
  readonly password: string;
}

export interface PasswordResetOutcome {
  readonly recoveryCode: string;
  readonly notification: NewNotification;
}

export interface EmailCodeRequestInput {
  readonly email: string;
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
  readonly email: string;
  readonly code: string;
  readonly password: string;
}

export interface CreateRecoveryAdminInput {
  readonly email: string;
  readonly displayName: string;
}

export interface OwnProfile {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly instanceRole: InstanceRole;
}

export interface LiveSessionRecord {
  readonly sessionId: string;
  readonly deviceLabel: string | null;
  readonly createdAt: Date;
  readonly lastUsedAt: Date;
}

export interface ListedSession {
  readonly id: string;
  readonly deviceLabel: string | null;
  readonly createdAt: string;
  readonly lastUsedAt: string;
  readonly current: boolean;
}

export interface ChangePasswordInput {
  readonly currentPassword: string;
  readonly newPassword: string;
}

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface NotificationInput {
  readonly userId: string;
  readonly type: NotificationType;
}

export interface NewNotification {
  readonly id: string;
  readonly userId: string;
  readonly type: NotificationType;
  readonly data: Record<string, string>;
}

export interface NotificationRecord {
  readonly notificationId: string;
  readonly type: string;
  readonly data: Record<string, string>;
  readonly createdAt: Date;
  readonly readAt: Date | null;
}

export interface ListedNotification {
  readonly id: string;
  readonly type: string;
  readonly data: Record<string, string>;
  readonly createdAt: string;
  readonly readAt: string | null;
}

export interface NotificationList {
  readonly notifications: ListedNotification[];
  readonly unreadCount: number;
}

export interface NotificationChannel {
  readonly name: string;
  deliver(notification: NewNotification): Promise<void>;
}

export interface RegeneratedRecoveryCode {
  readonly recoveryCode: string;
  readonly notification: NewNotification;
}
