const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ObjectID } = require('mongodb');
const Riddle = require('./models/riddle');
const User = require('./models/user');

var authenticated = null;

const updateScore = () => {
  console.log(authenticated);
  if (authenticated !== null) {
    User.find({ _id: authenticated })
      .then((result) => {
        console.log(result);
        result[0].score = result[0].score + 1;
        result[0]
          .save()
          .then((result) => {
            console.log(result);
          })
          .catch((err) => {
            res.status(500).json({
              message: 'Server Err0r',
            });
          });
      })
      .catch((err) => {
        res.status(500).json({
          message: 'Server Err0r',
        });
      });
  }
};

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

router.get('/score', (req, res, next) => {
  console.log(authenticated);
  if (authenticated === null) {
    res.status(400).json({
      message: 'Not authenticated',
    });
  } else {
    User.find({ _id: authenticated })
      .then((result) => {
        res.status(200).json({
          score: JSON.stringify(result[0].score),
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: 'Server Error',
        });
      });
  }
});

router.get('/', (req, res, next) => {
  Riddle.countDocuments().exec((err, count) => {
    var random = Math.floor(Math.random() * count);
    Riddle.findOne()
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

router.get('/previousriddles', (req, res, next) => {
  if (authenticated === null) {
    res.status(400).json({
      message: 'Please log in to access the riddles that you have submitted',
    });
  } else {
    User.find({ _id: authenticated })
      .then((result) => {
        console.log(result);
        res.status(200).json(result[0].previousriddles);
      })
      .catch((err) => {
        res.status(500).json({
          message: 'Server Err0r',
        });
      });
  }
});

router.get('/:riddleId', (req, res, next) => {
  const id = req.params.riddleId;
  const userAnswer = req.body.answer;
  Riddle.find({ _id: id })
    .then((result) => {
      console.log(result);
      if (userAnswer === result[0].answer) {
        res.status(200).json({ message: 'Correct!' });
        console.log(authenticated);
        if (authenticated) {
          updateScore();
        }
      } else {
        res.status(200).json({ message: 'Wrong answer! Try again' });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.post('/', (req, res, next) => {
  const riddle = new Riddle({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    answer: req.body.answer,
    author: req.body.author,
  });

  console.log(req.body);

  riddle
    .save()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: 'Post request',
        createdriddle: riddle,
      });
      if (authenticated) {
        User.find({ _id: authenticated }).then((res) => {
          res[0].previousriddles.unshift(riddle.name);
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

router.delete('/:riddlesId', (req, res, next) => {
  const id = req.params.riddlesId;

  Riddle.remove({ _id: id })
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
