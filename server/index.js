const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'user',
  host: 'db',
  database: 'guystrip',
  password: 'password',
  port: 5432,
});

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

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
