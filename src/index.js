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
app.post('/submitForm', async (req, res) => {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});