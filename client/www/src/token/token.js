'use strict';

angular.module('superloginDemo.tokens', [])

  .controller('ResetPasswordCtrl', function($scope, superlogin, $state, $stateParams, flashy) {
    $scope.reset = $stateParams;
    if(!$scope.reset.token) {
      flashy.set('Invalid password reset token');
      $state.go('navbar.login');
    }
    $scope.resetPassword = function() {
      superlogin.resetPassword($scope.reset)
        .then(function(res) {
          flashy.set('Your password was successfully reset');
          if(superlogin.authenticated()) {
            $state.go('navbar.todos');
          } else {
            $state.go('navbar.login');
          }
        }, function(err) {
          flashy.set(err.error);
          $state.go('navbar.login');
        });
    };
  })

  .controller('ConfirmEmailCtrl', function($scope, superlogin, $state, $location, flashy) {
    var params = $location.search();
    if(params.success) {
      flashy.set('Thank you for confirming your email');
      quit();
    } else {
      var msg = params.error;
      if(params.message) {
        msg += ': ' + params.message;
      }
      flashy.set(msg);
      quit();
    }

    function quit() {
      if (superlogin.authenticated()) {
        $state.go('navbar.todos');
      } else {
        $state.go('navbar.login');
      }
    }

  });
