'use strict';

angular.module('superloginDemo.navbar', [])

  .controller('NavbarCtrl', function($scope, $rootScope, superlogin, $state, Todos) {

    $rootScope.syncStatus = {};
    $rootScope.currentState = $state.current.name;
    $rootScope.stateTitle = $state.current.data.title;

    // Calls when there is an update on the sync status of our database
    $rootScope.$on('pm:update', function(event, db, action, status) {
      $scope.$apply(function() {
        if(superlogin.authenticated()) {
          $rootScope.syncStatus = status;
        } else {
          $rootScope.syncStatus = {};
        }
      });
    });

    // Logout if we don't have credentials to access the database
    $rootScope.$on('pm:error', function(event, db, err, status) {
      $scope.$apply(function() {
        $rootScope.syncStatus = status;
        if(err.error === 'unauthorized') {
          superlogin.logout('Session expired');
        }
      });
    });

    $rootScope.$on('$stateChangeSuccess', function(event, toState) {
      $rootScope.currentState = toState.name;
      $rootScope.stateTitle = toState.data.title;
    });

    $scope.logout = function() {
      superlogin.logout();
    };

    $scope.profile = function() {
      $state.go('navbar.profile');
    };

    $scope.todos = function() {
      $state.go('navbar.todos');
    };

  });
