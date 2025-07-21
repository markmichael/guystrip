const request = require('supertest');
const express = require('express');
const { Pool } = require('pg');

// Mock the Pool
jest.mock('pg', () => {
  const mPool = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

const app = express();
app.use(express.json());

// Your app's routes
const pool = new Pool();

app.get('/trips/:tripId/nominations', async (req, res) => {
  try {
    const { tripId } = req.params;
    const result = await pool.query('SELECT * FROM nominations WHERE trip_id = $1', [tripId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/trips/:tripId/nominations', async (req, res) => {
  try {
    const { tripId } = req.params;
    const { name } = req.body;
    const newNomination = await pool.query(
      'INSERT INTO nominations (trip_id, name) VALUES ($1, $2) RETURNING *',
      [tripId, name]
    );
    res.json(newNomination.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.put('/trips/:tripId/nominations/:nominationId', async (req, res) => {
  try {
    const { tripId, nominationId } = req.params;
    const { name } = req.body;
    const updatedNomination = await pool.query(
      'UPDATE nominations SET name = $1 WHERE id = $2 AND trip_id = $3 RETURNING *',
      [name, nominationId, tripId]
    );
    if (updatedNomination.rows.length === 0) {
      return res.status(404).send('Nomination not found');
    }
    res.json(updatedNomination.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/trips/:tripId/ranked-choice-votes', async (req, res) => {
  try {
    const { tripId } = req.params;
    const { voter_name, ranked_choices } = req.body;
    const newVote = await pool.query(
      'INSERT INTO ranked_choice_votes (trip_id, voter_name, ranked_choices) VALUES ($1, $2, $3) RETURNING *',
      [tripId, voter_name, ranked_choices]
    );
    res.json(newVote.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/trips/:tripId/ranked-choice-vote-results', async (req, res) => {
  try {
    const { tripId } = req.params;
    const result = await pool.query('SELECT ranked_choices FROM ranked_choice_votes WHERE trip_id = $1', [tripId]);
    const votes = result.rows.map(row => row.ranked_choices);

    const nominationScores = {};

    votes.forEach(vote => {
      for (const rank in vote) {
        const nominationName = vote[rank];
        const points = 6 - parseInt(rank); // 5 points for 1st, 4 for 2nd, etc.
        nominationScores[nominationName] = (nominationScores[nominationName] || 0) + points;
      }
    });

    const sortedResults = Object.entries(nominationScores).sort(([, scoreA], [, scoreB]) => scoreB - scoreA);

    res.json(sortedResults);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

describe('Nominations API', () => {
  let pool;
  beforeEach(() => {
    pool = new Pool();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get all nominations for a trip', async () => {
    const nominations = [{ id: 1, trip_id: 1, name: 'Hawaii' }];
    pool.query.mockResolvedValue({ rows: nominations });

    const res = await request(app).get('/trips/1/nominations');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(nominations);
  });

  it('should create a new nomination for a trip', async () => {
    const newNomination = { id: 1, trip_id: 1, name: 'Hawaii' };
    pool.query.mockResolvedValue({ rows: [newNomination] });

    const res = await request(app)
      .post('/trips/1/nominations')
      .send({ name: 'Hawaii' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(newNomination);
  });

  it('should update a nomination', async () => {
    const updatedNomination = { id: 1, trip_id: 1, name: 'Maui' };
    pool.query.mockResolvedValue({ rows: [updatedNomination] });

    const res = await request(app)
      .put('/trips/1/nominations/1')
      .send({ name: 'Maui' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(updatedNomination);
  });

  it('should submit a ranked choice vote', async () => {
    const newVote = { id: 1, trip_id: 1, voter_name: 'John Doe', ranked_choices: { '1': 'Hawaii', '2': 'Maui' } };
    pool.query.mockResolvedValue({ rows: [newVote] });

    const res = await request(app)
      .post('/trips/1/ranked-choice-votes')
      .send({ voter_name: 'John Doe', ranked_choices: { '1': 'Hawaii', '2': 'Maui' } });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(newVote);
  });

  it('should get ranked choice vote results', async () => {
    const votes = [
      { ranked_choices: { '1': 'Hawaii', '2': 'Maui', '3': 'Fiji' } },
      { ranked_choices: { '1': 'Maui', '2': 'Hawaii', '3': 'Fiji' } },
    ];
    pool.query.mockResolvedValue({ rows: votes });

    const res = await request(app).get('/trips/1/ranked-choice-vote-results');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual([['Hawaii', 9], ['Maui', 9], ['Fiji', 6]]);
  });
});
