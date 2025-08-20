CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    amount INTEGER NOT NULL,
    category TEXT NOT NULL,
    "timestamp" TIMESTAMPTZ DEFAULT NOW()
);