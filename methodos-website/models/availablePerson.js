var mongoose = require('mongoose');

var avPersonSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: false,
    trim: true
  },
  firstname: {
    type: String,
    required: false,
    trim: true
  },
  lastname: {
    type: String,
    required: false,
    trim: true
  },
  phone: {
    type: Number,
    required: false,
    trim: true
  },
  email: {
    type: String,
    required: false,
    trim: true
  },
  address: {
    type: String,
    required: false,
    trim: true
  },
  jobprimary: {
    type: String,
    required: false,
    trim: true
  },
  jobsecondary: {
    type: String,
    required: false,
    trim: true
  },
  jobsecondary1: {
    type: String,
    required: false,
    trim: true
  },
  jobsecondary2: {
    type: String,
    required: false,
    trim: true
  },
  rate: {
    type: Number,
    required: false,
    default: 0
  },
  afm: {
    type: Number,
    required: false,
    trim: true
  },
  nationality: {
    type: String,
    required: false,
    trim: true
  },
  startdate: {
    type: Date,
    required: false,
    default: Date.now

  },
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  }


});

var avPerson = mongoose.model('avPerson', avPersonSchema);
module.exports = avPerson;
