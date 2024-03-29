'use strict';
angular.module('listOfListsDirective', [])
  .directive('listOfLists', function ($rootScope, dbFactory, $state, localStorageService) {
    return {
      restrict: 'E',
      templateUrl: 'directives/listOfLists.html',

      scope: {
        store: '@store',
        source: '@source',
        listsData: '=listsData'
      },
      controller: function ($scope, dbFactory, $state) {
        // First, load the lists.
        //console.log('listoflists: ', $scope);
        if (localStorageService.get('user' + $rootScope.user.userId + 'lists')) {
          $scope.listsData = localStorageService.get('user' + $rootScope.user.userId + 'lists');
        }
        // Now, call for this the local user's lists to be populated.
        dbFactory.promiseListOfLists($rootScope.user.userId).then(function (d) {
          $scope.listsData = d;
          //console.log('my lists?', $rootScope.user.userId, d);
        });

        /* Link to List */
        $scope.showList = function (listId, listName, userFilter, focusTarget) {
          $state.go('app.list', {
            listId: listId,
            listName: listName,
            userFilter: userFilter,
            focusTarget: focusTarget
          });

          // dbFactory.showAList(listId, listName, userFilter, focusTarget);
        };
      }
    };
  });
