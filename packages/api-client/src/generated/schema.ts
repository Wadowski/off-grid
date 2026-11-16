// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export interface paths {
    "/calendars": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listCalendars"];
        put?: never;
        post: operations["createCalendar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/calendars/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["removeCalendar"];
        options?: never;
        head?: never;
        patch: operations["updateCalendar"];
        trace?: never;
    };
    "/calendars/{id}/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["createCalendarEvent"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/events/{id}/guests": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listEventGuests"];
        put?: never;
        post: operations["inviteEventGuest"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/events/{id}/guests/{guestUserId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["removeEventGuest"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        FamilyId: string;
        UserId: string;
        AccessGroupId: string;
        Timestamp: string;
        ErrorResponse: {
            code: string;
            message: string;
        };
        CreateFamilyRequest: {
            name: string;
            accent?: "blue" | "sky" | "teal" | "green" | "lime" | "amber" | "orange" | "red" | "pink" | "purple" | "indigo" | "slate";
            purpose?: "household" | "getaway" | "extended";
        };
        InviteEventGuestRequest: {
            guestUserId: string;
        };
        EventGuestList: {
            guests: {
                userId: string;
                invitedAt: string;
            }[];
        };
        Family: {
            id: string;
            name: string;
            createdAt: string;
        };
        ActiveFamily: {
            familyId: string;
        };
        SelectActiveFamilyRequest: {
            familyId: string;
        };
        FamilyList: {
            families: {
                id: string;
                name: string;
                role: "admin" | "member";
                accent: "blue" | "sky" | "teal" | "green" | "lime" | "amber" | "orange" | "red" | "pink" | "purple" | "indigo" | "slate";
                purpose: "household" | "getaway" | "extended";
            }[];
        };
        CreateAccountRequest: {
            displayName: string;
            email: string;
            password: string;
        };
        AccountCreated: {
            user: {
                id: string;
                email: string;
                displayName: string;
                instanceRole: "admin" | "user";
            };
            recoveryCode: string;
        };
        RegistrationStatus: {
            freshServer: boolean;
            registrationOpen: boolean;
        };
        SignInRequest: {
            email: string;
            password: string;
            rememberMe?: boolean;
            deviceLabel?: string;
        };
        SignedIn: {
            accessToken: string;
            accessExpiresAt: string;
            user: {
                id: string;
                email: string;
                displayName: string;
                instanceRole: "admin" | "user";
            };
        };
        SessionAccess: {
            accessToken: string;
            accessExpiresAt: string;
        };
        AdminUser: {
            id: string;
            email: string;
            displayName: string;
            instanceRole: "admin" | "user";
            status: "active" | "disabled";
            createdAt: string;
        };
        AdminUserList: {
            users: {
                id: string;
                email: string;
                displayName: string;
                instanceRole: "admin" | "user";
                status: "active" | "disabled";
                createdAt: string;
            }[];
        };
        Calendar: {
            id: string;
            name: string;
            color: "blue" | "teal" | "green" | "amber" | "rose" | "violet";
            familyId: string | null;
            isDefault: boolean;
        };
        CalendarList: {
            calendars: {
                id: string;
                name: string;
                color: "blue" | "teal" | "green" | "amber" | "rose" | "violet";
                familyId: string | null;
                isDefault: boolean;
            }[];
        };
        CreateCalendarRequest: {
            name: string;
            color: "blue" | "teal" | "green" | "amber" | "rose" | "violet";
            familyId?: string;
        };
        CreateCalendarEventRequest: {
            title: string;
            location?: string;
            description?: string;
            reminderOffsetsMinutes?: number[];
            isAllDay: false;
            startsAt: string;
            endsAt: string;
        } | {
            title: string;
            location?: string;
            description?: string;
            reminderOffsetsMinutes?: number[];
            isAllDay: true;
            startDate: string;
            endDate: string;
        };
        UpdateCalendarRequest: {
            name?: string;
            color?: "blue" | "teal" | "green" | "amber" | "rose" | "violet";
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
            userId: string;
            code: string;
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
            provider: ("gmail" | "icloud" | "fastmail" | "other") | null;
            fromAddress: string | null;
            smtpHost: string | null;
            smtpPort: number | null;
            smtpSecurity: ("tls" | "starttls" | "none") | null;
            username: string | null;
        };
        MailSettingsRequest: {
            email: string;
            fromAddress?: string;
            password: string;
            provider: "gmail" | "icloud" | "fastmail";
        } | {
            email: string;
            fromAddress?: string;
            password: string;
            provider: "other";
            username?: string;
            smtpHost: string;
            smtpPort: number;
            smtpSecurity: "tls" | "starttls" | "none";
        };
        AccountProfile: {
            id: string;
            email: string;
            displayName: string;
            instanceRole: "admin" | "user";
            families: {
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
                id: string;
                deviceLabel: string | null;
                createdAt: string;
                lastUsedAt: string;
                current: boolean;
            }[];
        };
        NotificationList: {
            notifications: {
                id: string;
                type: "password-changed" | "recovery-code-regenerated" | "event-invited" | "event-reminder";
                data: {
                    [key: string]: string;
                };
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
export interface operations {
    listCalendars: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CalendarList"];
                };
            };
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    createCalendar: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateCalendarRequest"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Calendar"];
                };
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    removeCalendar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    updateCalendar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateCalendarRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Calendar"];
                };
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    createCalendarEvent: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateCalendarEventRequest"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    listEventGuests: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EventGuestList"];
                };
            };
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    inviteEventGuest: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["InviteEventGuestRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    removeEventGuest: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                guestUserId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
}
