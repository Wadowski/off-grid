// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createContext } from "react";
import type { OpenEvent } from "./types.js";

export const EventOpenContext = createContext<OpenEvent | undefined>(undefined);
