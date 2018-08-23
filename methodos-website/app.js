var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var path = require('path');
var compression = require('compression');
var helmet = require('helmet');
var app = express();
var port = process.env.PORT || 3000;
app.use(helmet());


app.use("/public", express.static(path.join(__dirname, 'public')));

//mongodb connection
var uri = "mongodb+srv://nicolas:mongopassword@cluster0-z3p3m.mongodb.net/methodOS";
mongoose.connect(uri);
var db = mongoose.connection;
// mongo error
db.on('error', console.error.bind(console, 'connection error:'));

app.use(compression()); //Compress all routes

//use sessions for tracking logins
app.use(session({
  secret: 'anemoni',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

//make user ID available in templates
app.use(function (req, res, next) {
  res.locals.currentUser = req.session.userId;
  next();
});

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files from /public
app.use(express.static(__dirname + '/public'));

// view engine setup
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

// include routes
var routes = require('./routes/index');
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});


// error handler
// define as the last app.use callback
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.get('*', function(req, res) {
    res.redirect('/');
});

// listen on port 3000
app.listen(port, function () {
  console.log('methodOS website listening on',port);
});
