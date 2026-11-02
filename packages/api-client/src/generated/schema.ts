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
            code: string;
            password: string;
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
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
