CREATE TABLE trips (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  year INT NOT NULL,
  stage VARCHAR(255) DEFAULT 'nomination',
  status VARCHAR(255) DEFAULT 'active'
);

CREATE TABLE nominations (
  id SERIAL PRIMARY KEY,
  trip_id INT REFERENCES trips(id),
  name VARCHAR(255) NOT NULL
);

CREATE TABLE ranked_choice_votes (
  id SERIAL PRIMARY KEY,
  trip_id INT REFERENCES trips(id),
  voter_name VARCHAR(255) NOT NULL,
  ranked_choices JSONB NOT NULL
);

CREATE TABLE final_votes (
  id SERIAL PRIMARY KEY,
  trip_id INT REFERENCES trips(id),
  voter_name VARCHAR(255) NOT NULL,
  final_choice_id INT NOT NULL
);
