// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";

export const eventTitleSchema = z.string().trim().min(1).max(200);

export const eventLocationSchema = z.string().trim().min(1).max(200);

export const eventDescriptionSchema = z.string().trim().min(1).max(2000);

export const eventDateSchema = z.iso.date();

export const eventInstantSchema = z.iso.datetime({ offset: true });
