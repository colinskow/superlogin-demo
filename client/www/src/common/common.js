'use strict';

angular.module('superloginDemo.common', [])

  .factory('toasty', function($mdToast) {
    return function (text) {
      $mdToast.show(
        $mdToast.simple()
          .content(text)
          .position('bottom')
          // .parent(angular.element(document.querySelector('#toast')))
          .hideDelay(5000)
      );
    };
  })

  .factory('flashy', function($rootScope, toasty) {
    var set = function(text) {
      $rootScope.flashy = text;
    };
    var get = function() {
      if($rootScope.flashy) {
        toasty($rootScope.flashy);
        $rootScope.flashy = null;
      }
    };
    return {
      set: set,
      get: get
    };
  })

  .factory('prompty', function($mdDialog){
    return function(options) {
      options = options || {};
      var locals = {
        value: options.value || '',
        title: options.title || '',
        label: options.label || '',
        type: options.type || 'text',
        submitText: options.submitText || 'OK',
        required: options.required || false
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
        templateUrl: 'src/common/prompty.html',
        locals: {
          dialog: locals
        },
        focusOnOpen: false,
        targetEvent: options.event
      });
    };
  })

  .directive('matches', function() {
    return {
      require: 'ngModel',
      scope: {
        otherModelValue: '=matches'
      },
      link: function(scope, element, attributes, ctrl) {
        ctrl.$validators.matches = function(modelValue) {
          if(ctrl.$isEmpty(modelValue)) {
            return true;
          }
          return modelValue == scope.otherModelValue;
        };
        scope.$watch("otherModelValue", function() {
          ctrl.$validate();
        });
      }
    };
  });