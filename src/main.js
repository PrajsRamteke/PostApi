
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const dotenv = require("dotenv");
dotenv.config();

// Configure PostgreSQL connection using environment variables
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const app = express();
app.use(bodyParser.json());

// POST endpoint to receive data and store it in PostgreSQL
app.post('/submitform', async (req, res) => {
  try {
    const { mobilenumber, name, email, country, state, city, area, venue, ideas } = req.body;
    const newEntry = await pool.query(
      'INSERT INTO host (mobilenumber, name, email, country, state, city, area, venue, ideas) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [mobilenumber, name, email, country, state, city, area, venue, ideas]
    );
    res.json(newEntry.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET endpoint to retrieve all entries
app.get('/getalldata', async (req, res) => {
  try {
    const allEntries = await pool.query('SELECT * FROM host');
    res.json(allEntries.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET endpoint to retrieve entries by mobile number
app.get('/mobilenumber/:number', async (req, res) => {
  try {
    const { number } = req.params;
    const entries = await pool.query('SELECT * FROM host WHERE mobilenumber = $1', [number]);
    res.json(entries.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
