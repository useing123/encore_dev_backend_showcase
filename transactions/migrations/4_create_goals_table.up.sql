CREATE TABLE IF NOT EXISTS goals (
    id SERIAL PRIMARY KEY,
    week_start_date DATE NOT NULL UNIQUE,
    amount INTEGER NOT NULL -- amount in cents
);