var express = require('express');
var router = express.Router();

var User = require('../models/user');

var Person = require('../models/person');
var AvPerson = require('../models/availablePerson');
var NotAvPerson = require('../models/notAvailablePerson');

var Tool = require('../models/tool');
var AvTool = require('../models/availableTool');
var NotAvTool = require('../models/notAvailableTool');

var BackupProjects = require('../models/backup_projects');
var Projects = require('../models/projects');
var Tasks = require('../models/tasks');

var async = require('async');
var mid = require('../middleware');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var URL = require('url-parse');
var url  = require('url');

//*******************POST REQUESTS*******************\\


//*******************GET REQUESTS*******************\\

// editTaskDate
router.get('/editTaskDate', function(req, res, next) {
  var url_parts = url.parse(req.url).query.slice(0, -1);
  var value = url_parts.toString();

  var startIndex = value.indexOf('tostartdate=');
  var finishIndex = value.indexOf('&tofinishdate=');
  var idIndex = value.indexOf('&%5B%22id%22%2C%22');
  var taskIndex = value.indexOf('%22%2C%22taskname%22%2C%22');
  var end = value.indexOf('%22%5D');

  var id = value.slice(idIndex+18, taskIndex);
  var task = value.slice(taskIndex+26, end);
  var startdate = value.slice(startIndex+12, finishIndex);
  var finishdate = value.slice(finishIndex+14,idIndex)

  if (startdate < finishdate) {
    //remove + from string
    for (var i=0; i<task.length; i++) {
      if (task.charAt(i) === '+') {
        task = task.replace('+', ' ');
      }
    }
    Projects.update({'id': id, 'tasks.taskname': task}, { '$set': { 'tasks.$.tostartdate': startdate, 'tasks.$.tofinishdate': finishdate }}, (err) => {
      if (err)
        res.send(err)
    })
  } else {
    var err = new Error ('Start date is after End date');
    return next(err);
  }


  res.redirect('back');
});


// /logout
router.get('/logout', function(req, res, next) {
  if (req.session) {
    //delete sessions
    req.session.destroy(function(err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    })
  }
});

// /logins
router.get('/login', mid.loggedOut, function(req, res, next) {
  return res.render('login', {title: 'Log In'});
});

// /register
router.get('/register', mid.loggedOut, function(req, res, next) {
  return res.render('register', {title: 'Sign Up'});
});

// GET /profile
router.get('/profile', mid.requiresLogin, function(req, res, next) {
  User.findById(req.session.userId).exec(function(error, user) {
    if (error) {
      return next(error);
    } else {
      return res.render('profile', {
        title: 'Profile',
        name: user.name,
        job: user.job
      });
    }
  });
});


// project
router.get('/project/:id', function(req, res) {
  var url_parts = url.parse(req.url).query.slice(0, -1);
  var value = url_parts.toString();
    Projects.findOne({id: value}, (err, project) => {
      if (err)
        res.send(err)
        res.render('project', {
            title: 'Project Page',
            id: project.id,
            address: project.address,
            foreman: project.foreman,
            budget: project.budget,
            startdate: project.startdate,
            tasks: project.tasks
        });
    });
});

// GET /projects
router.get('/projects', mid.requiresLogin, function(req, res, next) {
  Projects.find({}, (err, projects) => {
    if (err)
      res.send(err)
    res.render('projects', {
      title: 'Projects',
      projects: projects
    });
  })
});

// Move task from notDone to done
router.get('/taskid', function(req, res, next) {
  var url_parts = url.parse(req.url).query.slice(0, -1);
  var value = url_parts.toString();

  var idIndex = value.indexOf('%5B%22id%22%2C%22');
  var taskIndex = value.indexOf('%22%2C%22task%22%2C%22');
  var personIndex = value.indexOf('%22%2C%22person%22%2C%22');
  var toolIndex = value.indexOf('%22%2C%22tool%22%2C%22');
  var end = value.indexOf('%22%5D');

  var id = value.slice(idIndex+17, taskIndex);
  var task = value.slice(taskIndex+22, personIndex);
  var person = value.slice(personIndex+24, toolIndex);
  var tool = value.slice(toolIndex+22, end)

  //remove + from string
  for (var i=0; i<task.length; i++) {
    if (task.charAt(i) === '+') {
      task = task.replace('+', ' ');
    }
  }

  //Task finished true
  Projects.update({'id': id, 'tasks.taskname': task}, { '$set': { 'tasks.$.done': 'true', 'tasks.$.dateFinished': new Date() }}, (err) => {
    if (err)
      res.send(err)
  })

        //Move worker from not available to available collections
        NotAvPerson.findOne({id: person}, (err, person) => {
          AvPerson.insertMany(person, function(error) {})
        })

        //Move tool from not available to available collections
        NotAvTool.findOne({id: tool}, (err, tool) => {
          AvTool.insertMany(tool, function(error) {})
        })

        //make sure docs are moved before deleted due to asyncronous nature of node
        setTimeout(function () {
          //remove worker from available collection
          NotAvPerson.remove({ id: person }, (err) => {
            if (err)
              res.send(err)
            console.log('delete'+person);
          })
        }, 1500);

        setTimeout(function () {
          //remove tool from available collection
          NotAvTool.remove({ id: tool }, (err) => {
            if (err)
              res.send(err)
          })
        }, 1400);
        res.redirect('back');
  });

// editTask
router.get('/editTask', function(req, res, next) {
  var url_parts = url.parse(req.url).query.slice(0, -1);
  var value = url_parts.toString();

  var idIndex = value.indexOf('%5B%22id%22%2C%22');
  var taskIndex = value.indexOf('%22%2C%22taskname%22%2C%22');
  var toolIndex = value.indexOf('%22%2C%22tools%22%2C%22');
  var mainIndex = value.indexOf('%22%2C%22mainworkers%22%2C%22');
  var secIndex = value.indexOf('%22%2C%22secworkers%22%2C');
  var tIdIndex = value.indexOf('%2C%22_id%22%2C%22');
  var end = value.indexOf('%22%5D');

  var id = value.slice(idIndex+17, taskIndex);
  var task = value.slice(taskIndex+26, toolIndex);
  var tools = value.slice(toolIndex+23, mainIndex);
  var mainworkers = value.slice(mainIndex+29, secIndex);
  var secworkers = value.slice(secIndex+25, tIdIndex);
  var _id = value.slice(tIdIndex+18, end)

  //remove + from string
  for (var i=0; i<task.length; i++) {
    if (task.charAt(i) === '+') {
      task = task.replace('+', ' ');
    }
  }

  //Nested mongo queries to render from different collections
  var personz = {};
  var toolz = {};
  var projectz = {};
  AvPerson.find({}, (err, person) => {
    AvTool.find({}, (err, tool) => {
      Projects.find({'id': id}, (err, project) => {
    toolz = tool;
    personz = person;
    projectz= project;
          res.render('editTask', {
              title: task,
              id: id,
              tid: _id,
              persons: personz,
              tools: tools,
              mainworkers: mainworkers,
              secworkers: secworkers,
              toolList: toolz
          });
        })
    })
  })
});

router.get('/editPeople', function(req, res, next) {
  var url_parts = url.parse(req.url).query;
  var value = url_parts.toString();

  var toolIndex = value.indexOf('selectTool=');
  var personIndex = value.indexOf('&selectPerson=');
  var tIdIndex = value.indexOf('&%5B%22tid%22%2C%22');
  var idIndex = value.indexOf('%22%2C%22id%22%2C%22');
  var end = value.indexOf('%22%5D=');

  var tooling = value.slice(toolIndex+11, personIndex);
  var person = value.slice(personIndex+14, tIdIndex);
  var taskId = value.slice(tIdIndex+19, idIndex);
  var id = value.slice(idIndex+20, end);

  //remove + from string
  for (var i=0; i<tooling.length; i++) {
    if (tooling.charAt(i) === '+') {
      tooling = tooling.replace('+', ' ');
    }
  }

    Projects.update({id: id, 'tasks._id': taskId }, { '$set': { 'tasks.$.mainworker': person, 'tasks.$.toolused': tooling }}, (err) => {
      if (err)
        res.send(err)
    })

      //Move worker from available to not available collections
      AvPerson.findOne({id: person}, (err, person) => {
        NotAvPerson.insertMany(person, function(error) {})
      })
      //Move tool from available to not available collections
      AvTool.findOne({id: tooling}, (err, tool) => {
        NotAvTool.insertMany(tool, function(error) {})
      })


      //make sure doc is moved before deleted due to asyncronous nature of node
      setTimeout(function () {
        //remove worker from available collection
        AvPerson.remove({ id: person }, (err) => {
          if (err)
            res.send(err)
        })
      }, 2000);

      //make sure doc is moved before deleted due to asyncronous nature of node
      setTimeout(function () {
        //remove tool from available collection
        AvTool.remove({ id: tooling }, (err) => {
          if (err)
            res.send(err)
        })
        res.redirect('back');
      }, 2000);


});

// GET /
router.get('/', function(req, res, next) {
  Projects.find({}, (err, projects) => {
    if (err)
      res.send(err)
    res.render('projects', {
      title: 'Projects',
      projects: projects
    });
  })
});

module.exports = router;
