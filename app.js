const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const path = require('path');

const contactsRouter = require('./routes/api/contacts');
const usersRouter = require('./routes/api/users');

const app = express();

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short';

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

// Configurare pentru servirea fișierelor statice
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/contacts', contactsRouter);
app.use('/users', usersRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

module.exports = app;