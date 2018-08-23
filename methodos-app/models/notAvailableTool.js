var mongoose = require('mongoose');

var notAvToolSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: false,
    trim: true
  },
  toolname: {
    type: String,
    required: false,
    trim: true
  },
  path: {
    type: String,
    required: true
  }

});

var notAvTool = mongoose.model('notAvTool', notAvToolSchema);
module.exports = notAvTool;
