CREATE TABLE access.should_not_exist (id uuid PRIMARY KEY);
SELECT no_such_function();
