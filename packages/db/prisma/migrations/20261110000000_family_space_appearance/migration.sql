-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

ALTER TABLE family.family
  ADD COLUMN accent  text NOT NULL DEFAULT 'blue'
    CHECK (accent IN ('blue', 'sage', 'terracotta', 'lilac')),
  ADD COLUMN purpose text NOT NULL DEFAULT 'household'
    CHECK (purpose IN ('household', 'getaway', 'extended'));
