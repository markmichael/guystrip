const request = require('supertest');
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

const app = require('./index');

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

  it("should update a trip's stage", async () => {
    const updatedTrip = { id: 1, name: 'Test Trip', year: 2025, stage: 'ranked-choice-vote' };
    pool.query.mockResolvedValue({ rows: [updatedTrip] });

    const res = await request(app)
      .put('/trips/1/stage')
      .send({ stage: 'ranked-choice-vote' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(updatedTrip);
  });

  it("should revert a trip to nomination stage and clear ranked choice votes", async () => {
    const revertedTrip = { id: 1, name: 'Test Trip', year: 2025, stage: 'nomination' };
    // Mock the DELETE query
    pool.query.mockImplementationOnce((sql, params) => {
      return Promise.resolve({ rows: [] }); // Always resolve for DELETE
    });

    // Mock the UPDATE query
    pool.query.mockImplementationOnce((sql, params) => {
      return Promise.resolve({ rows: [revertedTrip] }); // Always resolve for UPDATE
    });

    const res = await request(app).put('/trips/1/revert-to-nomination');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(revertedTrip);
    expect(pool.query).toHaveBeenCalledWith(
      'DELETE FROM ranked_choice_votes WHERE trip_id = $1',
      ['1']
    );
    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE trips SET stage = $1 WHERE id = $2 RETURNING *',
      ['nomination', '1']
    );
  });
});