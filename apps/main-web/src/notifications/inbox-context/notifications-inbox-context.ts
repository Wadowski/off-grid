// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createContext } from "react";
import type { NotificationsInbox } from "../inbox-store/types.js";

export const NotificationsInboxContext = createContext<NotificationsInbox | undefined>(undefined);
