// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CrossEntityLinkWithTitle } from "../../types.js";
import { toCrossEntityLink } from "./to-cross-entity-link.js";

export const toCrossEntityLinkWithTitle = (item: CrossEntityLinkWithTitle) => ({
  ...toCrossEntityLink(item.link),
  title: item.title,
});
