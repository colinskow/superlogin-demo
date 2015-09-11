'use strict';

angular.module('superloginDemo.profile', [])

  .controller('ProfileCtrl', function($scope, $rootScope, $http, $state, superlogin, toasty, flashy, prompty, passwordDialog, $mdDialog){
    $scope.loaded = false;
    $scope.profile = {};

    function refresh() {
      $scope.updating = true;
      $http.get('/user/profile')
        .then(function(res) {
          $scope.updating = false;
          $scope.profile = res.data;
          $scope.loaded = true;
        }, function(err) {
          $scope.updating = false;
          if(err.error) {
            toasty(err.error);
          }
          console.error(err.data);
        });
    }

    $scope.refresh = refresh;

    $scope.link = function(provider) {
      superlogin.link(provider)
        .then(function() {
          toasty(provider.toUpperCase() + ' link successful!');
          refresh();
        }, function(err) {
          toasty(err.error || provider.toUpperCase() + ' link failed');
          console.error(err);
        });
    };

    $scope.unlink = function(provider) {
      superlogin.unlink(provider)
        .then(function() {
          toasty(provider.toUpperCase() + ' unlinked.');
          refresh();
        }, function(err) {
          toasty(err.error || 'Unlink failed');
          console.error(err);
        });
    };

    $scope.changeName = function($event) {
      var originalName = $scope.profile.name;
      prompty({
        value: originalName,
        title: 'Change Your Name',
        type: 'text',
        submitText: 'Save',
        required: true,
        event: $event
      })
        .then(function(newName) {
          if(newName !== originalName) {
            $scope.updating = true;
            $http.post('/user/change-name', {newName: newName})
              .then(function() {
                $scope.updating = false;
                refresh();
              }, function(err) {
                $scope.updating = false;
                if(err) {
                  toasty(err.error + ': ' + err.message);
                  console.error(err);
                }
              });
          }
        });
    };

    $scope.changeEmail = function($event) {
      var originalEmail = $scope.profile.email;
      prompty({
        value: originalEmail,
        title: 'Change Your Email',
        type: 'email',
        submitText: 'Save',
        required: true,
        event: $event
      })
        .then(function(newEmail) {
          if(newEmail !== originalEmail) {
            $scope.updating = true;
            $http.post('/auth/change-email', {newEmail: newEmail})
              .then(function() {
                $scope.updating = false;
                refresh();
                toasty('Please confirm your new email address');
              }, function(err) {
                $scope.updating = false;
                if(err) {
                  toasty(err.error + ': ' + err.message);
                  console.error(err);
                }
              });
          }
        });
    };

    $scope.changePassword = function($event) {
      console.log($scope.profile.providers);
      passwordDialog({event: $event, requireCurrentPassword: ($scope.profile.providers.indexOf('local') > -1)})
        .then(function(form) {
          $scope.updating = true;
          return superlogin.changePassword(form);
        })
        .then(function() {
          $scope.updating = false;
          refresh();
          toasty('Password change successful!');
        }, function(err) {
          $scope.updating = false;
          if(err) {
            toasty(err.error + ': ' + err.message);
            console.error(err);
          }
        });
    };

    $scope.logoutOthers = function() {
      superlogin.logoutOthers()
        .then(function() {
          refresh();
          toasty('All other sessions were logged out');
        }, function(err) {
          toasty(err);
          console.error(err);
        });
    };

    $scope.destroyUser = function(event) {
      var confirm1 = $mdDialog.confirm()
        .title('Delete Your Account?')
        .content('All your precious SuperLogin Demo data will be gone.')
        .ariaLabel('Delete Account')
        .targetEvent(event)
        .ok('DESTROY IT!')
        .cancel('Never Mind');

      var confirm2 = $mdDialog.confirm()
        .title('Are You Really Sure?')
        .content('How will you know what to do without your SuperLogin Todo list?')
        .ariaLabel('Are you sure?')
        .targetEvent(event)
        .ok('YES I\'M SURE')
        .cancel('Cancel Destruction');

      var confirm3 = $mdDialog.confirm()
        .title('Last Chance')
        .content('You have one last chance to back out before destroying everything.')
        .ariaLabel('Last Chance')
        .targetEvent(event)
        .ok('BYE BYE FOREVER')
        .cancel('I\'m chicken');

      $mdDialog.show(confirm1)
        .then(function() {
          return $mdDialog.show(confirm2);
        })
        .then(function() {
          return $mdDialog.show(confirm3);
        })
        .then(function() {
          return $http.post('/user/destroy');
        })
        .then(function() {
          superlogin.deleteSession();
          $rootScope.$broadcast('sl:logout', 'User destroyed');
        })
        .catch(function(err) {
          if(!err) {
            toasty('We knew you didn\'t have the guts to carry though!');
          } else {
            toasty('An error occurred, check your console.');
            console.error(err);
          }
        });
    };

    refresh();

  })

  .factory('passwordDialog', function($mdDialog) {
    return function(options) {
      options = options || {};
      var locals = {
        title: options.requireCurrentPassword ? 'Change Password' : 'Set Password',
        requireCurrentPassword: options.requireCurrentPassword
      };
      return $mdDialog.show({
        controller: function($scope, $mdDialog, dialog) {
          $scope.dialog = dialog;
          $scope.hide = function() {
            $mdDialog.hide();
          };
          $scope.cancel = function() {
            $mdDialog.cancel();
          };
          $scope.done = function(value) {
            $mdDialog.hide(value);
          };
        },
        templateUrl: 'src/profile/change-password.html',
        locals: {
          dialog: locals,
          form: {}
        },
        focusOnOpen: false,
        targetEvent: options.event
      });
    };
  });