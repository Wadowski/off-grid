-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2
CREATE TABLE food.ingredient (id uuid PRIMARY KEY, name text NOT NULL);
SELECT public.offgrid_declare_scope('food', 'ingredient', 'shared');
