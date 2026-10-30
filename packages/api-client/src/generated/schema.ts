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
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
