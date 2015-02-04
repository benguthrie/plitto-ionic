'use strict';
angular.module('listsController', [])

/* 10/21/2014 - Added RootScope to populate the list with? TODO1 - Build lists from $rootScope.lists */
.controller('ListsCtrl', function ($scope, dbFactory, localStorageService, $rootScope) {

  // On load, load up their lists.
  $scope.listsData = localStorageService.get('user' + $rootScope.user.userId + 'lists');

  // On Load; Update with new data

  dbFactory.promiseListOfLists($rootScope.user.userId).then(function (d) {
    $scope.listsData = d;
  });


  $scope.loadLists = function () {
    // user.userId is hard coded in lists, because it's always going to be this user's lists.

    dbFactory.promiseListOfLists($rootScope.user.userId).then(function (d) {
      $scope.listsData = d;
    });
  };

  // TODO3 Delete a list
});