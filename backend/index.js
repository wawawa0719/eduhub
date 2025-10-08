require('dotenv').config();
const express = require('express');
const db = require('./db');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Welcome to SLPLMS Backend!');
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);

app.listen(port, async () => {
  try {
    const connection = await db.getConnection();
    console.log('Database connected successfully!');
    connection.release();
  } catch (err) {
    console.error('Database connection failed:', err);
  }
  console.log(`Server is running on http://localhost:${port}`);
});
