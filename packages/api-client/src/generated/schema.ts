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
        /** List the calendars the signed-in person can access */
        get: operations["listCalendars"];
        put?: never;
        /** Create a calendar */
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
        /** Delete a calendar */
        delete: operations["removeCalendar"];
        options?: never;
        head?: never;
        /** Change the name or color of a calendar */
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
        /** Create an event in a calendar the signed-in person can access */
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
        get?: never;
        put?: never;
        /** Invite a family member to an event the signed-in person hosts */
        post: operations["inviteEventGuest"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
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
            /** @enum {string} */
            accent?: "blue" | "sky" | "teal" | "green" | "lime" | "amber" | "orange" | "red" | "pink" | "purple" | "indigo" | "slate";
            /** @enum {string} */
            purpose?: "household" | "getaway" | "extended";
        };
        InviteEventGuestRequest: {
            /** Format: uuid */
            guestUserId: string;
        };
        Family: {
            /** Format: uuid */
            id: string;
            name: string;
            /** Format: date-time */
            createdAt: string;
        };
        ActiveFamily: {
            /** Format: uuid */
            familyId: string;
        };
        SelectActiveFamilyRequest: {
            /** Format: uuid */
            familyId: string;
        };
        FamilyList: {
            families: {
                /** Format: uuid */
                id: string;
                name: string;
                /** @enum {string} */
                role: "admin" | "member";
                /** @enum {string} */
                accent: "blue" | "sky" | "teal" | "green" | "lime" | "amber" | "orange" | "red" | "pink" | "purple" | "indigo" | "slate";
                /** @enum {string} */
                purpose: "household" | "getaway" | "extended";
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
        Calendar: {
            /** Format: uuid */
            id: string;
            name: string;
            /** @enum {string} */
            color: "blue" | "teal" | "green" | "amber" | "rose" | "violet";
            familyId: string | null;
            isDefault: boolean;
        };
        CalendarList: {
            calendars: {
                /** Format: uuid */
                id: string;
                name: string;
                /** @enum {string} */
                color: "blue" | "teal" | "green" | "amber" | "rose" | "violet";
                familyId: string | null;
                isDefault: boolean;
            }[];
        };
        CreateCalendarRequest: {
            name: string;
            /** @enum {string} */
            color: "blue" | "teal" | "green" | "amber" | "rose" | "violet";
            /** Format: uuid */
            familyId?: string;
        };
        CreateCalendarEventRequest: {
            title: string;
            location?: string;
            description?: string;
            /** @constant */
            isAllDay: false;
            /** Format: date-time */
            startsAt: string;
            /** Format: date-time */
            endsAt: string;
        } | {
            title: string;
            location?: string;
            description?: string;
            /** @constant */
            isAllDay: true;
            /** Format: date */
            startDate: string;
            /** Format: date */
            endDate: string;
        };
        UpdateCalendarRequest: {
            name?: string;
            /** @enum {string} */
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
            provider: ("gmail" | "icloud" | "fastmail" | "other") | null;
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
            provider: "gmail" | "icloud" | "fastmail";
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
                type: "password-changed" | "recovery-code-regenerated" | "event-invited";
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
            /** @description The calendars the person can access. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CalendarList"];
                };
            };
            /** @description UNAUTHENTICATED: the request has no signed-in person. */
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
            /** @description The created calendar. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Calendar"];
                };
            };
            /** @description VALIDATION_FAILED: the body does not match the request schema. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description UNAUTHENTICATED: the request has no signed-in person. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description NOT_FOUND: the family does not exist or the person is not in it. */
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
            /** @description The calendar was deleted. */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description VALIDATION_FAILED: the id does not match the schema. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description UNAUTHENTICATED: the request has no signed-in person. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description ACCESS_DENIED: the person may not access this calendar. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description NOT_FOUND: the calendar does not exist. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description DEFAULT_CALENDAR: the default calendar cannot be deleted. */
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
            /** @description The updated calendar. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Calendar"];
                };
            };
            /** @description VALIDATION_FAILED: the id or body does not match the schema. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description UNAUTHENTICATED: the request has no signed-in person. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description NOT_FOUND: the calendar does not exist. */
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
            /** @description The created event. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description VALIDATION_FAILED: the body does not match the request schema. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description UNAUTHENTICATED: the request has no signed-in person. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description NOT_FOUND: the calendar does not exist or the person cannot access it. */
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
            /** @description The guest was already invited. Nothing changed. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description The guest was invited. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description VALIDATION_FAILED: the body is invalid, the guest is the host, shares no family with the host, or the event belongs to a family. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description UNAUTHENTICATED: the request has no signed-in person. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description FORBIDDEN: a guest of the event may not invite others. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description NOT_FOUND: the event does not exist or the person cannot see it. */
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
