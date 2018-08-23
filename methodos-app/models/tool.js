var mongoose = require('mongoose');

var ToolSchema = new mongoose.Schema({
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

var Tool = mongoose.model('Tool', ToolSchema);
module.exports = Tool;
