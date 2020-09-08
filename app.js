const express = require('express');
const morgan = require('morgan');
const factRouters = require('./api/routes/facts');
const riddleRouters = require('./api/routes/riddles');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

mongoose.connect(
  'mongodb+srv://aryan:abcd1234@cluster0.39ko8.azure.mongodb.net/<dbname>?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
app.use(morgan('dev'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'POST, GET, DELETE, PUT, PATCH');
    return res.status(200).json({});
  }

  next();
});

app.use('/facts', factRouters);
app.use('/riddles', riddleRouters);

module.exports = app;
