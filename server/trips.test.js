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

app.get('/trips', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM trips');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/trips', async (req, res) => {
  try {
    const { name, year } = req.body;
    const newTrip = await pool.query(
      'INSERT INTO trips (name, year) VALUES ($1, $2) RETURNING *',
      [name, year]
    );
    res.json(newTrip.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

describe('Trips API', () => {
  let pool;
  beforeEach(() => {
    pool = new Pool();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get all trips', async () => {
    const trips = [{ id: 1, name: 'Test Trip', year: 2025 }];
    pool.query.mockResolvedValue({ rows: trips });

    const res = await request(app).get('/trips');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(trips);
  });

  it('should create a new trip', async () => {
    const newTrip = { id: 1, name: 'Test Trip', year: 2025 };
    pool.query.mockResolvedValue({ rows: [newTrip] });

    const res = await request(app)
      .post('/trips')
      .send({ name: 'Test Trip', year: 2025 });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(newTrip);
  });
});
