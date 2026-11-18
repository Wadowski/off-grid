// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";

export const containerSummarySchema = z.looseObject({
  Id: z.string().min(1),
  Names: z.array(z.string()),
  Image: z.string(),
});

export const containerInspectSchema = z.looseObject({
  Id: z.string().min(1),
  Name: z.string().min(2),
  Image: z.string().min(1),
  Config: z.looseObject({
    Image: z.string().min(1),
    Env: z.array(z.string()).nullish(),
  }),
  HostConfig: z.record(z.string(), z.unknown()),
  NetworkSettings: z.looseObject({
    Networks: z.record(z.string(), z.unknown()).nullish(),
  }),
});

export const imageInspectSchema = z.looseObject({
  Id: z.string().min(1),
  RepoDigests: z.array(z.string()).nullish(),
  Config: z.looseObject({
    Env: z.array(z.string()).nullish(),
    Labels: z.record(z.string(), z.string()).nullish(),
  }),
});

export const containerCreatedSchema = z.looseObject({ Id: z.string().min(1) });

export const containerWaitSchema = z.looseObject({ StatusCode: z.number().int() });
