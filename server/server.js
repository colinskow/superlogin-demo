'use strict';

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');

var SuperLogin = require('superlogin');
var superloginConfig = require('./superlogin.config.js');

var WindowsliveStrategy = require('passport-windowslive').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GitHubStrategy = require('passport-github').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var LinkedinStrategy = require('passport-linkedin-oauth2').Strategy;


var app = express();

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, '../client/www/favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Redirect to https except on localhost
app.use(httpsRedirect);

app.use(express.static(path.join(__dirname, '../client/www')));
app.use(logger('dev'));

app.use(function(req, res, next) {
  console.log(req.get('X-Forwarded-Proto'));
  console.log(req.protocol);
  var protocol = req.get('X-Forwarded-Proto') || req.protocol + '://';
  console.log(protocol);
  next();
});

// load SuperLogin routes
var superlogin = new SuperLogin(superloginConfig);
if(superlogin.config.getItem('providers.windowslive.credentials.clientID'))
  superlogin.registerOAuth2('windowslive', WindowsliveStrategy);
if(superlogin.config.getItem('providers.facebook.credentials.clientID'))
  superlogin.registerOAuth2('facebook', FacebookStrategy);
if(superlogin.config.getItem('providers.github.credentials.clientID'))
  superlogin.registerOAuth2('github', GitHubStrategy);
if(superlogin.config.getItem('providers.google.credentials.clientID'))
  superlogin.registerOAuth2('google', GoogleStrategy);
if(superlogin.config.getItem('providers.linkedin.credentials.clientID'))
  superlogin.registerOAuth2('linkedin', LinkedinStrategy);
app.use('/auth', superlogin.router);

var Profile = require('./profile');
var profile = new Profile(superlogin);

app.get('/user/profile', superlogin.requireAuth, function(req, res, next) {
  profile.get(req.user._id)
    .then(function(userProfile) {
      res.status(200).json(userProfile);
    }, function(err) {
      return next(err);
    });
});

app.post('/user/change-name', superlogin.requireAuth, function(req, res, next) {
  if(!req.body.newName) {
    return next({
      error: "Field 'newName' is required",
      status: 400
    });
  }
  profile.changeName(req.user._id, req.body.newName)
    .then(function(userProfile) {
      res.status(200).json(userProfile);
    }, function(err) {
      return next(err);
    });
});

app.post('/user/destroy', superlogin.requireAuth, function(req, res, next) {
  superlogin.removeUser(req.user._id, true)
    .then(function() {
      console.log('User destroyed!');
      res.status(200).json({ok: true, success: 'User: ' + req.user._id + ' destroyed.'});
    }, function(err) {
      return next(err);
    });
});

app.use('*', function(req, res) {
  res.sendFile('index.html', {root: path.join(__dirname, '../client/www')});
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// Force HTTPS redirect unless we are using localhost
function httpsRedirect(req, res, next) {
  if(req.protocol === 'https' || req.header('X-Forwarded-Proto') === 'https' || req.hostname === 'localhost') {
    return next();
  }
  res.status(301).redirect("https://" + req.headers['host'] + req.url);
}

module.exports = app;
