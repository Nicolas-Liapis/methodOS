var mongoose = require('mongoose');

var avToolSchema = new mongoose.Schema({
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

var avTool = mongoose.model('avTool', avToolSchema);
module.exports = avTool;
