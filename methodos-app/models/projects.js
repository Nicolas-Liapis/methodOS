var mongoose = require('mongoose');
var TaskSchema = require('./tasks').schema;


var ProjectsSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: false,
    trim: true
  },
  address: {
    type: String,
    required: false,
    trim: true
  },
  foreman: {
    type: String,
    required: false
  },
  startdate: {
    type: Date,
    required: false
  },
  budget: {
    type: Number,
    required: false
  },
  tasks: [TaskSchema]
});

var Projects = mongoose.model('Projects', ProjectsSchema);

module.exports = Projects;
