const express = require('express');
const app = express();

const dotEnv = require('dotenv');
dotEnv.config();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors());

const mongoDb = require('mongodb');

const mongoose = require('mongoose');
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' );
//
const Models = require('./models')();
const User = Models.user;

app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


// Routes

/*
 * Username is posted in request body as username
 * Save a new user with username and return json {objectId: user._id, userName: user.userName} 
 */
app.post('/api/exercise/new-user', (req, res) =>
{
  let userName = req.body.username;
  let newUser = new User({name: userName});
  newUser.save()
    .then((newUser) => 
    {
      res.json({objectId: newUser._id, userName: newUser.name});
    })
    .catch((err) =>
    {
      res.json({errorType: err.name, errorMsg: err._message});
    })
});

/*
 * I can get an array of all users by getting api/exercise/users with the same info as when creating a user.
 *
 * 
 */
app.get('/api/exercise/users', (req, res) =>
{
  User.find({}, '_id name', (err, result) =>
  {
    if(err)
    {
      console.log(err);
    }
    else
    {
      res.json(result);
    }
  });
});

/*
 * I can add an exercise to any user by posting form data
 * userId(_id), description, duration, and optionally date to /api/exercise/add. If no date supplied it will use current date. 
 * Returned will the the user object with also with the exercise fields added.
 *
 */
app.post('/api/exercise/add', (req, res) =>
{
  let exercise = 
  {
    'description': req.body.description,
    'duration': req.body.duration,
    'date': (req.body.date) ? req.body.date : new Date()
  };
  User.findByIdAndUpdate(req.body.userId, {$push: {exercises: exercise}}, (err, result) =>
  {
    if(err)
      console.log('error: ' + err);
    else{
      console.log(exercise);
      console.log(result);
      res.json(result);
    }
  });
});



// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
});

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});
