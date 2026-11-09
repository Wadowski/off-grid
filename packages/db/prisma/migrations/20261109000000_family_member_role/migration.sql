-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

ALTER TABLE family.family_member
  ADD COLUMN role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member'));

UPDATE family.family_member SET role = 'admin';
