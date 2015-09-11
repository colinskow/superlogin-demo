'use strict';

angular.module('superloginDemo',
  [
    'superloginDemo.common',
    'superloginDemo.navbar',
    'superloginDemo.login',
    'superloginDemo.tokens',
    'superloginDemo.todos',
    'superloginDemo.profile',
    'superlogin',
    'ui.router',
    'ngMaterial',
    'ngMessages'
  ])

  .config(function($stateProvider, $urlRouterProvider, $locationProvider, superloginProvider, $mdIconProvider) {

    $mdIconProvider
      .defaultFontSet( 'material-icons' );

    $stateProvider

    // setup an abstract state for the tabs directive
    .state('navbar', {
      url: "/navbar",
      abstract: true,
      templateUrl: "src/navbar/navbar.html",
      controller: 'NavbarCtrl'
    })

    .state('navbar.login', {
      url: "^/login",
      templateUrl: "src/login/login.html",
      controller: 'LoginCtrl',
      data: {
        title: 'SuperLogin Demo'
      }
    })

    .state('navbar.resetPassword', {
      url: "^/password-reset/:token",
      templateUrl: "src/token/reset.html",
      controller: 'ResetPasswordCtrl',
        data: {
          title: 'Reset Password'
        }
    })

    .state('confirm', {
      url: "^/confirm-email",
      controller: 'ConfirmEmailCtrl'
    })

    .state('navbar.todos', {
      url: '^/',
      templateUrl: 'src/todos/todos.html',
      controller: 'TodosCtrl',
      resolve: {
        authenticate: authenticate
      },
        data: {
          title: 'SuperLogin Todos'
        }
    })

    .state('navbar.profile', {
      url: '^/profile',
      templateUrl: 'src/profile/profile.html',
      controller: 'ProfileCtrl',
        data: {
          title: 'Profile'
        }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/');

    $locationProvider.html5Mode(true);

    var superloginConfig = {
      baseUrl: '/auth/',
      checkExpired: 'stateChange',
      providers: ['facebook', 'google', 'github', 'windowslive', 'linkedin']
    };
    superloginProvider.configure(superloginConfig);

    function authenticate($q, superlogin, $state, $timeout) {
      if (superlogin.authenticated()) {
        // Resolve the promise successfully
        return $q.when();
      } else {
        // The next bit of code is asynchronously tricky.
        $timeout(function() {
          // This code runs after the authentication promise has been rejected.
          $state.go('navbar.login');
        });
        // Reject the authentication promise to prevent the state from loading
        return $q.reject();
      }
    }

  })

  .run(function($rootScope, $state, flashy) {
    $rootScope.$on('sl:logout', function(event, message) {
      switch(message) {
        case 'Session expired':
          flashy.set("Aww... your session expired buddy!");
          break;
        case 'User destroyed':
          flashy.set('Your account was destroyed. The developer of this app will mourn your loss :-(');
          break;
        default:
          flashy.set('Sorry to see you go!');
      }
      $state.go('navbar.login');
    });
  });
