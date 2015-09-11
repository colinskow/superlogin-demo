'use strict';

var BPromise = require('bluebird');
var YAML = require('yamljs');

module.exports = function(superlogin) {
  var userDB = superlogin.userDB;

  this.get = function(user_id) {
    var profile = {};
    return userDB.get(user_id)
      .then(function(userDoc) {
        profile._id = userDoc._id;
        profile.name = userDoc.name;
        profile.email = userDoc.email;
        profile.providers = userDoc.providers;
        userDoc.providers.forEach(function(provider) {
          if(provider !== 'local') {
            var info = YAML.stringify(userDoc[provider].profile._json);
            profile[provider] = info;

          }
        });
        // Make a list
        var providerConfig = superlogin.config.getItem('providers');
        var allProviders = [];
        if(providerConfig) {
          Object.keys(providerConfig).forEach(function(key) {
            allProviders.push(key);
          });
        }
        profile.allProviders = allProviders;
        profile.sessions = 0;
        if(userDoc.session) {
          profile.sessions = Object.keys(userDoc.session).length;
        }
        return BPromise.resolve(profile);
      });
  };

  this.changeName = function(user_id, newName) {
    return userDB.get(user_id)
      .then(function(userDoc) {
        userDoc.name = newName;
        return userDB.put(userDoc);
      });
  };

};