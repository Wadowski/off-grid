CREATE TABLE lists.list (id uuid PRIMARY KEY, family_id uuid, user_id uuid, title text NOT NULL);
SELECT public.offgrid_declare_scope('lists', 'list', 'family-or-user');
