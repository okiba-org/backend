DROP SCHEMA IF EXISTS bin CASCADE;
CREATE SCHEMA bin;

CREATE TABLE bin.pastes (
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    paste_id VARCHAR(6) NOT NULL,
    content TEXT NOT NULL
)