CREATE TABLE trips (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  year INT NOT NULL,
  stage VARCHAR(255) DEFAULT 'nomination'
);
