// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CrossEntityLinkRecord, LinkEndpoint } from "../types.js";
import { isSameEndpoint } from "./is-same-endpoint.js";

export const otherEndOf = (link: CrossEntityLinkRecord, endpoint: LinkEndpoint): LinkEndpoint =>
  isSameEndpoint(link.source, endpoint) ? link.target : link.source;
