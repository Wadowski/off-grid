-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2
CREATE TABLE access.access_grant (id uuid PRIMARY KEY, family_id uuid NOT NULL, note text NOT NULL);
SELECT public.offgrid_declare_scope('access', 'access_grant', 'family');
