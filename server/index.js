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

app.get('/trips', async (req, res) => {  try {    const { includeArchived } = req.query;    let query = 'SELECT * FROM trips';    if (includeArchived !== 'true') {      query += ' WHERE status = \'active\'';    }    const result = await pool.query(query);    res.json(result.rows);  } catch (err) {    console.error(err);    res.status(500).send('Server error');  }});

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

app.put('/trips/:tripId/stage', async (req, res) => {
  try {
    const { tripId } = req.params;
    const { stage } = req.body;
    const updatedTrip = await pool.query(
      'UPDATE trips SET stage = $1 WHERE id = $2 RETURNING *',
      [stage, tripId]
    );
    if (updatedTrip.rows.length === 0) {
      return res.status(404).send('Trip not found');
    }
    res.json(updatedTrip.rows[0]);
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
    const votesResult = await pool.query('SELECT ranked_choices FROM ranked_choice_votes WHERE trip_id = $1', [tripId]);
    const votes = votesResult.rows.map(row => row.ranked_choices);

    const nominationsResult = await pool.query('SELECT id, name FROM nominations WHERE trip_id = $1', [tripId]);
    const nominationIdToName = nominationsResult.rows.reduce((acc, row) => {
      acc[row.id] = row.name;
      return acc;
    }, {});

    const nominationScores = {};

    votes.forEach(vote => {
      for (const rank in vote) {
        const nominationId = vote[rank];
        const nominationName = nominationIdToName[nominationId];
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

app.put('/trips/:tripId/revert-to-nomination', async (req, res) => {
  try {
    const { tripId } = req.params;
    // Delete ranked choice vote data for this trip
    await pool.query('DELETE FROM ranked_choice_votes WHERE trip_id = $1', [tripId]);
    // Update trip stage to nomination
    const updatedTrip = await pool.query(
      'UPDATE trips SET stage = $1 WHERE id = $2 RETURNING *',
      ['nomination', tripId]
    );
    if (updatedTrip.rows.length === 0) {
      return res.status(404).send('Trip not found');
    }
    res.json(updatedTrip.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.put('/trips/:tripId/rename', async (req, res) => {
  try {
    const { tripId } = req.params;
    const { name } = req.body;
    const updatedTrip = await pool.query(
      'UPDATE trips SET name = $1 WHERE id = $2 RETURNING *',
      [name, tripId]
    );
    if (updatedTrip.rows.length === 0) {
      return res.status(404).send('Trip not found');
    }
    res.json(updatedTrip.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.put('/trips/:tripId/archive', async (req, res) => {
  try {
    const { tripId } = req.params;
    const updatedTrip = await pool.query(
      'UPDATE trips SET status = \'archived\' WHERE id = $1 RETURNING *',
      [tripId]
    );
    if (updatedTrip.rows.length === 0) {
      return res.status(404).send('Trip not found');
    }
    res.json(updatedTrip.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

if (require.main === module) {
  app.listen(3001, () => {
    console.log('Server is running on port 3001');
  });
}

module.exports = app;
