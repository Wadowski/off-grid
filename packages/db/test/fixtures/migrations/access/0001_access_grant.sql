CREATE TABLE access.access_grant (id uuid PRIMARY KEY, family_id uuid NOT NULL, note text NOT NULL);
SELECT public.offgrid_declare_scope('access', 'access_grant', 'family');
