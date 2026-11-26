// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const serverOrigin = (): string => import.meta.env.VITE_API_ORIGIN ?? "";
