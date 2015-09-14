'use strict';

angular.module('superloginDemo.todos', ['pouchMirror'])

  .controller('TodosCtrl', function($scope, $rootScope, $mdBottomSheet, $mdDialog, Todos, flashy, toasty, prompty) {

    $scope.$on('$stateChangeSuccess', function() {
      flashy.get();
    });

    $scope.mouseOver = '';

    // listen to changes
    var changes = Todos.changes(function() {
      Todos.all().then(function(todos) {
        $scope.$apply(function() {
          $scope.todos = todos;
        });
      });
    });

    // prevent memory leaks
    $scope.$on('$destroy', function() {
      if(changes) {
        changes.cancel();
      }
    });

    $scope.remove = function(todo) {
      Todos.remove(todo);
    };

    $scope.modify = function(todo) {

      Todos.save(angular.copy(todo)).then(function(result) {

      }, function(err) {
        console.error(err);
      });
    };


    $scope.showListBottomSheet = function(todo, $event) {
      $mdBottomSheet.show({
        templateUrl: 'src/todos/todo-bottom-sheet.html',
        controller: 'ListBottomSheetCtrl',
        targetEvent: $event
      }).then(function(clickedItem) {
        switch(clickedItem) {
          case 'EDIT':
            $scope.editDialog(todo);
            break;
          case 'DELETE':
            $scope.remove(todo);
            break;
        }
      });
    };

    $scope.editDialog = function(todo) {
      var myTodo;
      if(!todo) {
        myTodo = {
          type: 'todo',
          text: '',
          complete: false
        };
      } else {
        myTodo = angular.copy(todo);
      }
      prompty({
        value: myTodo.text,
        title: myTodo.text ? 'Edit Todo' : 'New Todo',
        label: 'What do you need to get done?',
        type: 'text',
        submitText: 'Save',
        required: true
      })
        .then(function(newText) {
          if(myTodo.text !== newText) {
            myTodo.text = newText;
            if (myTodo._id) {
              Todos.save(myTodo);
            } else {
              Todos.create(myTodo);
            }
          }
        });
    };
  })

  .directive('todoMenu', function() {
    return {
      restrict: 'E',
      scope: {
        item: '='
      },
      templateUrl: 'src/todos/todo-menu.html'
    };
  })

  .controller('ListBottomSheetCtrl', function($scope, $mdBottomSheet) {
    $scope.items = [
      { name: 'EDIT', icon: 'edit' },
      { name: 'DELETE', icon: 'delete' },
      { name: 'CANCEL', icon: 'cancel' }
    ];
    $scope.listItemClick = function($index) {
      var clickedItem = $scope.items[$index].name;
      $mdBottomSheet.hide(clickedItem);
    };
  })

  .factory('Todos', function($q, $rootScope, PouchMirror, superlogin, timestampID) {

    var db;

    function startSequence() {
      var remoteDbUrl = superlogin.getDbUrl('todos');
      db = new PouchMirror('todos', remoteDbUrl);
    }

    function destroySequence() {
      if(db) {
        return db.destroyLocal()
          .then(function() {
            db = null;
          });
      }
      return $q.when();
    }

    if(superlogin.authenticated()){
      startSequence();
    }

    $rootScope.$on('sl:login', function() {
      // Make sure data from previous user is erased
      destroySequence()
        .then(function() {
          startSequence();
        });
    });

    $rootScope.$on('sl:logout', function() {
      destroySequence();
    });

    return {
      all: function() {
        return db.allDocs({include_docs: true}).then(function(results) {
          var todos = [];
          results.rows.forEach(function(row) {
            if(row.doc.type === 'todo') {
              todos.push(row.doc);
            }
          });
          return $q.when(todos);
        });
      },
      remove: function(todo) {
        return db.remove(todo);
      },
      get: function(id) {
        return db.get(id);
      },
      save: function(todo) {
        return db.put(angular.copy(todo));
      },
      create: function(todo) {
        todo._id = timestampID('todo');
        return db.put(angular.copy(todo));
      },
      changes: function(onChange) {
        db.changes({live: true})
          .on('change', onChange);
      }
    };
  })

  .factory('timestampID', function() {
    return function(docType, order) {
      order = order || 0;
      var timestamp = Date.now();
      timestamp += order;
      return docType + ':' + new Date(timestamp).toISOString() + ':' + base64Bytes(4);
    };
    function base64Bytes(length) {
      var URLSafeBase64 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";
      var result = '';
      for(var i=0; i<length; i++) {
        var rand = Math.floor(Math.random() * 64);
        result += URLSafeBase64.charAt(rand);
      }
      return result;
    }
  });