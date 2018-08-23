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

var upload = require('./upload');
var mid = require('../middleware');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var URL = require('url-parse');
var url  = require('url');

//*******************POST REQUESTS*******************\\

//POST /login
router.post('/login', function(req, res, next) {
  if (req.body.email && req.body.password) {
    User.authenticate(req.body.email, req.body.password, function(error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });
  } else {
    var err = new Error('Email and password are required.');
    err.status = 401;
    return next(err);
  }
});


//POST /register
//This post request was created after completing a training module on express.js from teamtreehouse.com
router.post('/register', function(req, res, next) {
  if (req.body.email && req.body.name && req.body.confirmPassword) {

    //confirm Password
    if (req.body.password !== req.body.confirmPassword) {
      var err = new Error('Passwords do not match.');
      return next(err);
    }
    //create object form
    var userData = {
      email: req.body.email,
      name: req.body.name,
      job: req.body.job,
      password: req.body.password
    };

    //insert doc into mongo
    User.create(userData, function(error, user) {
      if (error) {
        return next(error);
      } else {
        req.session.userId = user._id;
        res.redirect('back');
      }
    });

  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
});

//POST /personRegister
var personData;
router.post('/personRegister', function(req, res, next) {

  //create object form
   personData = {
    id: req.body.id,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    phone: req.body.phone,
    email: req.body.email,
    address: req.body.address,
    jobprimary: req.body.jobprimary,
    jobsecondary: req.body.jobsecondary,
    jobsecondary1: req.body.jobsecondary1,
    jobsecondary2: req.body.jobsecondary2,
    rate: req.body.rate,
    afm: req.body.afm,
    nationality: req.body.nationality,
    startDate: req.body.startdate,
    score: req.body.score
  };

  //insert doc into mongo
  Person.create(personData, function(error) {
    if (req.body.score === null) {
      personData.score = 1;
    }
    if (error) {
      return next(error);
    } else {
      res.redirect('back');
    }
  });

  AvPerson.create(personData, function(error) {
    if (error) {
      return next(error);
    }
  });
});

//POST /toolRegister
var toolData;
router.post('/toolRegister', function(req, res, next) {

  upload(req, res, (error) => {
    if (error) {
      return next(error);
    } else {
      var fullPath = "files/" + req.file.filename;

       toolData = {
        id: req.body.id,
        toolname: req.body.toolname,
        path: fullPath
      };

      //insert doc into mongo
      Tool.create(toolData, function(error) {
        if (error) {
          return next(error);
        }
      });
      AvTool.create(toolData, function(error) {
        if (error) {
          return next(error);
        }
        res.redirect('back');
      });
    }
  });
});

//POST /projectRegister
var projectData;
router.post('/projects', function(req, res, next) {

  //create object form
   projectData = {
    id: req.body.id,
    address: req.body.address,
    foreman: req.body.foreman,
    budget: req.body.budget,
    startdate: req.body.startdate
  };

  //insert doc into mongo
  Projects.create(projectData, function(error) {
    if (error) {
      return next(error);
    }
  });
  //doc backup
  BackupProjects.create(projectData, function(error) {
    if (error) {
      return next(error);
    } else {
      res.redirect('back');
    }
  });
});

//*******************GET that send data to server*******************\\
  //GET scoreup
  router.get('/scoreup/:id', function(req, res, next) {
    var url_parts = url.parse(req.url).query.slice(0, -1);
    var value = url_parts.toString();

        Person.update({id: value}, { $inc: { score: 1 }}, (err) => {
          if (err)
            res.send(err)
        })
        AvPerson.update({id: value}, { $inc: { score: 1 }}, (err) => {
          if (err)
            res.send(err)
        })
        res.redirect('/personRegister');
      });

  //GET scoredown
  router.get('/scoredown/:id', function(req, res, next) {
    var url_parts = url.parse(req.url).query.slice(0, -1);
    var value = url_parts.toString();
        Person.update({id: value}, { $inc: { score: -1 }}, (err) => {
          if (err)
            res.send(err)
        })
        AvPerson.update({id: value}, { $inc: { score: -1 }}, (err) => {
          if (err)
            res.send(err)
        })
        res.redirect('/personRegister');
      });

//*******************GET REQUESTS*******************\\

//GET /logout
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

//GET /logins
router.get('/login', mid.loggedOut, function(req, res, next) {
  return res.render('login', {title: 'Log In'});
});

//GET /register
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

// GET /personregister
router.get('/personRegister', function(req, res, next) {
  Person.find({}, (err, people) => {
    if (err)
      res.send(err)
    res.render('personRegister', {
      title: 'People',
      people: people
    });
  })
});

// GET /toolregister
router.get('/toolRegister', function(req, res, next) {
  Tool.find({}, (err, tools) => {
    if (err)
      res.send(err)
    res.render('toolRegister', {
      title: 'Tools',
      tools: tools
    });
  })
});

//GET project
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
            startdate: project.startdate,
            budget: project.budget,
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

//GET add a task to tasks
router.get('/addTask/:taskname/:tools', function(req, res, next) {
  var url_parts = url.parse(req.url).query.slice(0, -1);
  var value = url_parts.toString();

  var taskIndex = value.indexOf('taskname=');
  var toolIndex = value.indexOf('&tools=');
  var mainIndex = value.indexOf('&mainworkers=');
  var secIndex = value.indexOf('&secworkers=');
  var daysIndex = value.indexOf('&days=')
  var idIndex = value.lastIndexOf('&');

  var taskname = value.slice(taskIndex+9, toolIndex);
  var tools = value.slice(toolIndex+7, mainIndex);
  var mainworkers = value.slice(mainIndex+13, secIndex);
  var secworkers = value.slice(secIndex+12, daysIndex);
  var days = value.slice(daysIndex+6, idIndex)
  var id = value.slice(idIndex+1);

  //remove + from string
  for (var i=0; i<taskname.length; i++) {
    if (taskname.charAt(i) === '+') {
      taskname = taskname.replace('+', ' ');
    }
  }
  console.log(mainworkers);
  console.log(secworkers);
  console.log(tools);
  console.log(taskname);

  //Add task to array
  Projects.update({id: id}, { $push: {tasks: {taskname: taskname , tools: tools, mainworkers: mainworkers, secworkers: secworkers, days: days }}}, (err) => {
    if (err)
      res.send(err)
  })
  res.redirect('back');
});

// GET /about
router.get('/about', function(req, res, next) {
  return res.render('about', {title: 'About'});
});

// GET /
router.get('/', function(req, res, next) {
  return res.render('index', {title: 'Home'});
});

//*******************GET/DELETE*******************\\

//Delete tool
router.get('/toolRegister/:id', function(req, res, next) {
  var url_parts = url.parse(req.url).query.slice(0, -1);
  var value = url_parts.toString();
  Tool.remove({'id': value}, (err) => {
    if (err)
      res.send(err)
  })
  res.redirect('back');
});

//Delete project
router.get('/projects/:id', function(req, res, next) {
  var url_parts = url.parse(req.url).query.slice(0, -1);
  var value = url_parts.toString();
  Projects.remove({'id': value}, (err) => {
    if (err)
      res.send(err)
  })
  res.redirect('back');
});

//Delete person
router.get('/personRegister/:id', function(req, res, next) {
  var url_parts = url.parse(req.url).query.slice(0, -1);
  var value = url_parts.toString();
  console.log(value);
  Person.remove({'id': value}, (err) => {
    if (err)
      res.send(err)
  })
  res.redirect('back');
});

//Delete task
router.get('/:task', function(req, res, next) {
  var url_parts = url.parse(req.url).query.slice(0, -1);
  var value = url_parts.toString();
  var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

  var task1 = value;
  for (var i=0; i<value.length; i++) {
    if (task1.charAt(i) === '+') {
      task1 = task1.replace('+', ' ');
    }
  }
  //Remove array element from tasks
  Projects.update({}, { $pull: { tasks: {_id: task1} }}, {multi: true}, (err) => {
    if (err)
      res.send(err)
  })
  res.redirect('back');
});


module.exports = router;
