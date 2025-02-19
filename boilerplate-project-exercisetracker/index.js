const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded())
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URI)

const personSchema = mongoose.Schema({
  username: {
    type: String,
    required: true
  }
})
const personModel = mongoose.model('person', personSchema, 'people')

const exerciseSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'person'
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  }
})
const exerciseModel = mongoose.model('exercise', exerciseSchema, 'exercises')

app.post('/api/users', async (req, res) => {
  const userName = req.body.username
  const user = await personModel.create({username: userName})
  res.send({username: user.username, _id: user._id})
})

app.get('/api/users', async (req, res) => {
  const users = (await personModel.find({})).map(user => ({username: user.username, _id: user._id}))
  res.send(users)
})

app.post('/api/users/:_id/exercises', async (req, res) => {
  const userId = req.params._id
  const description = req.body.description
  const duration = parseInt(req.body.duration)
  let date
  try {
    date = req.body.date ? new Date(req.body.date) : new Date()
  } catch (e) {
    res.send('Invalid date')
    return
  }

  const user = await personModel.findById(userId)
  if (!user) {
    res.send('User not found')
    return
  }

  const exercise = await exerciseModel.create({userId, description, duration, date})
  res.send({
    _id: user._id,
    username: user.username,
    date: exercise.date.toDateString(),
    duration: exercise.duration,
    description: exercise.description
  })

})

app.get('/api/users/:_id/logs', async (req, res) => {
  const userId = req.params._id
  const user = await personModel.findById(userId)
  if (!user) {
    res.send('User not found')
    return
  }
  const { from, to, limit } = req.query

  const userExercises = (await exerciseModel.find({
    $and: [
      { userId: userId },
      { date: { $gte: from || new Date(0), $lte: to || new Date() } }
    ]
  }).limit(limit)).map(exercise => ({
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString()
  }))

  res.send({
    _id: user._id,
    username: user.username,
    count: userExercises.length,
    log: userExercises
  })

})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
