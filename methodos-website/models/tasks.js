var mongoose = require('mongoose');

var TaskSchema = new mongoose.Schema({

    taskname: {
      type:String,
      unique: true
    },
    tools: String,
    mainworkers: String,
    secworkers: Number,
    days: Number,
    done: {
      type: Boolean,
      default: false
    },
    mainworker: String,
    toolused: String,
    tostartdate: Date,
    tofinishdate: Date,
    dateFinished: Date

});

var Tasks = mongoose.model('Tasks', TaskSchema);

module.exports = Tasks;
