const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
};

app.use(errorHandler);

// Post Data input validation
const validateData = (req, res, next) => {
  const { mobilenumber, name, email } = req.body;

  if (!mobilenumber || !name) {
    return res.status(400).json({ error: 'mobilenumber, name fields are required' });
  }

  next();
};
// Submit form / post api
app.post('/submitform', validateData, async (req, res, next) => {
  try {
    const { mobilenumber, name, email, country, state, city, area, venue, ideas } = req.body;
    const newEntry = await pool.query(
      'INSERT INTO host (mobilenumber, name, email, country, state, city, area, venue, ideas) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [mobilenumber, name, email, country, state, city, area, venue, ideas]
    );
    res.json(newEntry.rows[0]);
  } catch (err) {
    next(err);
  }
});
// get 10  User
app.get('/getalldata', async (req, res) => {
  const { page = 1, pageSize = 10 } = req.query;

  try {
    const offset = (page - 1) * pageSize;
    const paginatedEntries = await pool.query('SELECT * FROM host LIMIT $1 OFFSET $2', [pageSize, offset]);
    
    const totalCount = await pool.query('SELECT COUNT(*) FROM host');
    res.header('X-Total-Count', totalCount.rows[0].count);
    
    res.json(paginatedEntries.rows);
  } catch (err) {
    next(err);
  }
});
// get User by number
app.get('/mobilenumber/:number', async (req, res) => {
  try {
    const { number } = req.params;
    const entries = await pool.query('SELECT * FROM host WHERE mobilenumber = $1', [number]);
    res.json(entries.rows);
  } catch (err) {
    next(err);
  }
});
// update User
app.put('/updateuser/:id', async (req, res) => {
  const { id } = req.params;
  const { mobilenumber, name, email, country, state, city, area, venue, ideas } = req.body;

  try {
    const updatedEntry = await pool.query(
      'UPDATE host SET mobilenumber = $1, name = $2, email = $3, country = $4, state = $5, city = $6, area = $7, venue = $8, ideas = $9 WHERE id = $10 RETURNING *',
      [mobilenumber, name, email, country, state, city, area, venue, ideas, id]
    );
    res.json(updatedEntry.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Delete User
app.delete('/deleteuserfromdatabase/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM host WHERE id = $1', [id]);
    res.json({ message: 'Entry deleted successfully' });
  } catch (err) {
    next(err);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
