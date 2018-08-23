var mongoose = require('mongoose');

var BackupProjectsSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: false,
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
  details: {
    type: String,
    required: false
  }

});

var BackupProjects = mongoose.model('BackupProjects', BackupProjectsSchema);
module.exports = BackupProjects;
