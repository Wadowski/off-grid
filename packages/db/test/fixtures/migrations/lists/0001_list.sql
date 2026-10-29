-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2
CREATE TABLE lists.list (id uuid PRIMARY KEY, family_id uuid, user_id uuid, title text NOT NULL);
SELECT public.offgrid_declare_scope('lists', 'list', 'family-or-user');
