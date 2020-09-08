const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ObjectID } = require('mongodb');
const Fact = require('./models/fact');
const User = require('./models/user');

var authenticated = null;

router.get('/', (req, res, next) => {
  Fact.countDocuments().exec((err, count) => {
    var random = Math.floor(Math.random() * count);
    Fact.findOne()
      .skip(random)
      .exec()
      .then((result) => {
        console.log(result);
        res.status(200).json(result);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
  });
});

router.post('/register', (req, res, next) => {
  const user = new User({
    _id: new mongoose.Types.ObjectId(),
    email: req.body.email,
    password: req.body.password,
    score: 0,
  });

  user
    .save()
    .then((result) => {
      console.log(result);
      authenticated = result._id;
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
      authenticated = null;
      res.status(500).json(err);
    });
});

router.get('/login', (req, res, next) => {
  User.find({ email: req.body.email })
    .then((result) => {
      console.log(result);
      if (req.body.password === result[0].password) {
        res.status(200).json({ message: 'Logged In' });
        authenticated = result[0]._id;
      } else {
        res.status(400).json({ message: 'Wrong Credentials' });
        authenticated = null;
      }
    })
    .catch((err) => {
      console.log(err);
      authenticated = null;
      res.status(500).json(err);
    });
});

router.get('/logout', (req, res, next) => {
  authenticated = null;
  res.status(200).json({
    message: 'Logged Out',
  });
});

router.get('/previousfacts', (req, res, next) => {
  if (authenticated === null) {
    res.status(400).json({
      message: 'Please log in to access the facts that you have submitted',
    });
  } else {
    User.find({ _id: authenticated })
      .then((result) => {
        console.log(result);
        res.status(200).json(result[0].previousfacts);
      })
      .catch((err) => {
        res.status(500).json({
          message: 'Server Err0r',
        });
      });
  }
});

router.post('/', (req, res, next) => {
  const fact = new Fact({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    author: req.body.author,
  });

  fact
    .save()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: 'Post request',
        createdFact: fact,
      });
      if (authenticated) {
        User.find({ _id: authenticated }).then((res) => {
          res[0].previousfacts.unshift(fact.name);
          res[0].save();
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.delete('/:factsId', (req, res, next) => {
  const id = req.params.factsId;

  Fact.remove({ _id: id })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;
