CREATE TABLE food.ingredient (id uuid PRIMARY KEY, name text NOT NULL);
SELECT public.offgrid_declare_scope('food', 'ingredient', 'shared');
