// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { SelectHTMLAttributes } from "react";

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "style" | "className">;
