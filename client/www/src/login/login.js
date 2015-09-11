'use strict';

angular.module('superloginDemo.login', [])

  .controller('LoginCtrl', function($scope, superlogin, $state, toasty, flashy, prompty) {
    $scope.$on('$stateChangeSuccess', function() {
      flashy.get();
    });

    $scope.tabIndex = 0;

    $scope.gotoLogin = function() {
      $scope.tabIndex = 0;
    };

    $scope.gotoReg = function() {
      $scope.tabIndex = 1;
    };

    // Login
    $scope.credentials = {};
    $scope.loginError = '';
    $scope.login = function () {
      $scope.loginError = '';
      $scope.authPending = true;
      superlogin.login($scope.credentials)
        .then(function () {
          $scope.authPending = false;
          flashy.set('Login Successful!');
          $state.go('navbar.todos');
        }, function (err) {
          $scope.authPending = false;
          if(err) {
            $scope.loginError = err.message;
          } else {
            $scope.loginError = 'Could not connect to the server.';
          }
        });
    };

    // Facebook
    $scope.socialAuth = function(provider) {
      $scope.authPending = true;
      superlogin.socialAuth(provider)
        .then(function() {
          $scope.authPending = false;
          flashy.set(provider.toUpperCase() + ' Authorization Successful!');
          $state.go('navbar.todos');
        }, function(err) {
          $scope.authPending = false;
          toasty(err);
        });
    };

    // Registration
    $scope.registration = {};
    $scope.signupError = '';
    $scope.register = function() {
      $scope.signupError = '';
      $scope.authPending = true;
      superlogin.register($scope.registration)
        .then(function() {
          $scope.authPending = false;
          if(superlogin.authenticated()) {
            flashy.set('Registration successful, welcome!');
            $state.go('navbar.todos');
          } else {
            $scope.tabIndex = 0;
            $scope.registration = {};
            $scope.regForm.$setPristine();
            $scope.regForm.$setUntouched();
            toasty('Registration successful.');
          }
        }, function(err) {
          var errorArray = [];
          if(err.validationErrors) {
            Object.keys(err.validationErrors).forEach(function(key) {
              errorArray.push(err.validationErrors[key]);
            });
          }
          $scope.authPending = false;
          $scope.signupError = err.error + ': ' + errorArray.join(', ') || err.message;
        });
    };

    // Forgot Password
    $scope.passwordDialog = function($event) {
      prompty({
        title: 'Password Recovery',
        label: 'Enter your email address',
        type: 'email',
        submitText: 'Send',
        required: true,
        event: $event
      })
        .then(function(email) {
          return superlogin.forgotPassword(email);
        })
        .then(function() {
          toasty('Check your email!');
        }, function(err) {
          if(err) {
            console.error(err);
            toasty(err.error);
          }
        });
    };

    // Check if we are already authenticated and redirect
    if (superlogin.authenticated()) {
      $state.go('navbar.todos');
    }
  })

  .directive('checkUsername', function($q, superlogin) {
    return {
      require: 'ngModel',
      link: function(scope, elm, attrs, ctrl) {

        ctrl.$asyncValidators.checkUsername = function(modelValue) {
          if (ctrl.$isEmpty(modelValue)) {
            // consider empty model valid
            return $q.when();
          }
          return superlogin.validateUsername(modelValue);
        };
      }
    };
  })

  .directive('checkEmail', function($q, superlogin) {
    return {
      require: 'ngModel',
      link: function(scope, elm, attrs, ctrl) {

        ctrl.$asyncValidators.checkEmail = function(modelValue) {
          if (ctrl.$isEmpty(modelValue)) {
            // consider empty model valid
            return $q.when();
          }
          return superlogin.validateEmail(modelValue);
        };
      }
    };
  });