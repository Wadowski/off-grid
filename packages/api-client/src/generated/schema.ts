// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type paths = Record<string, never>;
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** Format: uuid */
        FamilyId: string;
        /** Format: uuid */
        UserId: string;
        /** Format: uuid */
        AccessGroupId: string;
        /** Format: date-time */
        Timestamp: string;
        ErrorResponse: {
            code: string;
            message: string;
        };
        CreateFamilyRequest: {
            name: string;
        };
        Family: {
            /** Format: uuid */
            id: string;
            name: string;
            /** Format: date-time */
            createdAt: string;
        };
        FamilyList: {
            families: {
                /** Format: uuid */
                id: string;
                name: string;
            }[];
        };
        CreateAccountRequest: {
            displayName: string;
            /** Format: email */
            email: string;
            password: string;
        };
        AccountCreated: {
            user: {
                /** Format: uuid */
                id: string;
                email: string;
                displayName: string;
                /** @enum {string} */
                instanceRole: "admin" | "user";
            };
            recoveryCode: string;
        };
        RegistrationStatus: {
            freshServer: boolean;
            registrationOpen: boolean;
        };
        SignInRequest: {
            /** Format: email */
            email: string;
            password: string;
            rememberMe?: boolean;
            deviceLabel?: string;
        };
        SignedIn: {
            accessToken: string;
            /** Format: date-time */
            accessExpiresAt: string;
            user: {
                /** Format: uuid */
                id: string;
                email: string;
                displayName: string;
                /** @enum {string} */
                instanceRole: "admin" | "user";
            };
        };
        SessionAccess: {
            accessToken: string;
            /** Format: date-time */
            accessExpiresAt: string;
        };
        AdminUser: {
            /** Format: uuid */
            id: string;
            email: string;
            displayName: string;
            /** @enum {string} */
            instanceRole: "admin" | "user";
            /** @enum {string} */
            status: "active" | "disabled";
            /** Format: date-time */
            createdAt: string;
        };
        AdminUserList: {
            users: {
                /** Format: uuid */
                id: string;
                email: string;
                displayName: string;
                /** @enum {string} */
                instanceRole: "admin" | "user";
                /** @enum {string} */
                status: "active" | "disabled";
                /** Format: date-time */
                createdAt: string;
            }[];
        };
        PasswordResetRequest: {
            email: string;
            code: string;
            password: string;
        };
        PasswordRecoveryRequest: {
            email: string;
            recoveryCode: string;
            password: string;
        };
        PasswordRecoveryOptions: {
            emailCodeAvailable: boolean;
        };
        EmailCodeRequest: {
            email: string;
        };
        PasswordResetIssued: {
            /** Format: uuid */
            userId: string;
            code: string;
            /** Format: date-time */
            expiresAt: string;
        };
        InstanceSettings: {
            registrationOpen: boolean;
        };
        InstanceSettingsUpdate: {
            registrationOpen: boolean;
        };
        MailSettings: {
            configured: boolean;
            provider: ("gmail" | "icloud" | "fastmail" | "outlook" | "other") | null;
            fromAddress: string | null;
            smtpHost: string | null;
            smtpPort: number | null;
            smtpSecurity: ("tls" | "starttls" | "none") | null;
            username: string | null;
        };
        MailSettingsRequest: {
            /** Format: email */
            email: string;
            /** Format: email */
            fromAddress?: string;
            password: string;
            /** @enum {string} */
            provider: "gmail" | "icloud" | "fastmail" | "outlook";
        } | {
            /** Format: email */
            email: string;
            /** Format: email */
            fromAddress?: string;
            password: string;
            /** @constant */
            provider: "other";
            username?: string;
            smtpHost: string;
            smtpPort: number;
            /** @enum {string} */
            smtpSecurity: "tls" | "starttls" | "none";
        };
        AccountProfile: {
            /** Format: uuid */
            id: string;
            email: string;
            displayName: string;
            /** @enum {string} */
            instanceRole: "admin" | "user";
            families: {
                /** Format: uuid */
                id: string;
                name: string;
            }[];
        };
        UpdateProfileRequest: {
            displayName: string;
        };
        ChangePasswordRequest: {
            currentPassword: string;
            newPassword: string;
        };
        PasswordConfirmationRequest: {
            password: string;
        };
        RecoveryCodeIssued: {
            recoveryCode: string;
        };
        SessionList: {
            sessions: {
                /** Format: uuid */
                id: string;
                deviceLabel: string | null;
                /** Format: date-time */
                createdAt: string;
                /** Format: date-time */
                lastUsedAt: string;
                current: boolean;
            }[];
        };
        NotificationList: {
            notifications: {
                /** Format: uuid */
                id: string;
                /** @enum {string} */
                type: "password-changed" | "recovery-code-regenerated";
                data: {
                    [key: string]: string;
                };
                /** Format: date-time */
                createdAt: string;
                readAt: string | null;
            }[];
            unreadCount: number;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
