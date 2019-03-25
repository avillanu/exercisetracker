const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
var mongodb = require('mongodb');
mongoose.connect(process.env.MONGO_URI,{useNewUrlParser: true});
var db = mongoose.connection;
console.log(mongoose.connection.readyState);
var Schema = mongoose.Schema;

var UsernameSchema = new Schema({
    username: String
});
var Username = db.model('Username', UsernameSchema);

var ExerciseSchema = new Schema({
    userId: String,
    description: String,
    duration: Number,
    date: Date
});
var Exercise = db.model('Exercise', ExerciseSchema);

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/exercise/new-user', function(req, res){
  var newUsername = new Username({username:req.body.username})
  newUsername.save(function(err, data){
          if(err) {
       //     return done(err);
          }
          else {
            Username.findOne({username:req.body.username},function(err,result){
              if(err){}

              else
              {
              res.json(result);
              }
          //   return done(null, data);

          })}

});})

app.post('/api/exercise/add', function(req, res){
    var newExercise = new Exercise({userId:req.body.userId,description:req.body.description, duration:req.body.duration,date:req.body.date})
    newExercise.save(function(err, data){
      if(err){
      }
       else
          {
          Exercise.findOne({userId:req.body.userId,description:req.body.description, duration:req.body.duration,date:req.body.date},function(err,result){
              if(err){
              }
              else
              {
              res.json(result);
              }
          //   return done(null, data);

          })}

});})
app.get('/api/exercise/log', function(req,res){
  var query = {userId:req.query.userId}
  if (req.query.from){
    query.date = {$gte: req.query.from}}
  if (req.query.to){
    query.date = {$lte: req.query.to}}
  if (req.query.from && req.query.to){
    query.date = { "$gte": req.query.from, "$lte": req.query.to }
    }
  console.log(query);
  Exercise.find(query,function(err,result){
    if(err){
    console.log(err);
    }
    else
    {
    console.log("hello")
    res.json(result)
    }
}).limit(parseInt(req.query.limit))
})
// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

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
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
