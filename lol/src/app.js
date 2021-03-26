const helmet = require('helmet');
const express = require('express');
const cors = require('cors');
const expressPino = require('express-pino-logger');

const logger = require('./logger');
const db = require('./models/db');
const { getActions } = require('./models/action');

const app = express();

app.use(helmet());
app.use(cors());
app.use(
  expressPino({
    logger,
  }),
);

app.get('/', async (req, res) => {
  try {
    await db.raw('SELECT 1;');
  } catch (_) {
    res.status(500);
    res.send({ status: 'not ok' });
    return;
  }
  res.status(200);
  res.send({
    status: 'ok',
  });
});

module.exports = app;
