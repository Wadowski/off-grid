CREATE TABLE family.family_setting (id uuid PRIMARY KEY, family_id uuid NOT NULL, label text NOT NULL);
SELECT public.offgrid_declare_scope('family', 'family_setting', 'family');
