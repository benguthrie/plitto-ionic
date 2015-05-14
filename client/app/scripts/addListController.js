'use strict';
angular.module('addListController', [])
  .controller('addListCtrl', function ($scope, $stateParams, dbFactory, pltf, $state) {


    $scope.newList = {
      title: ''
    };
    $scope.listResults = [];
    // console.log('addListCtrl called');

    // Initialize a new search.
    $scope.$watch(function () {
      return $scope.newList.title;
    }, function (newValue, oldValue) {
      // console.log('Changed from unused oldvalue (TODO2) ' + oldValue + ' to ' + newValue);
      if (typeof newValue !== 'undefined' && newValue.length > 0 && newValue !== oldValue) {
        //   console.log('oldValue is not used. ', oldValue)
        dbFactory.promiseSearch(newValue, 'list').then(function (d) {
          // console.log('got content from list title search.');
          $scope.listResults = d.results;
        });
      }
    });

    // List Link
    $scope.showList = function (listId, listName, userFilter) {
      // console.log('showList controllers.js 361, RESTORE LINK TO LIST.');

      // TODO2 - Use focusTarget?
      $state.go('app.list', {
        listId: listId,
        listName: listName,
        userFilter: userFilter
      });
      // dbFactory.showAList(listId, listName, userFilter, focusTarget);
    };

    $scope.createList = function () {
      // console.log('User Clicked "Create List" with this title: ' + $scope.newList.title);

      dbFactory.newList($scope.newList.title).then(function (d) {

        if (parseInt(d)) {
          $state.go('app.list', {
            listId: d
          });
        }
        /* TODO2 Error Handling
        else {
          // console.log('invalid listid passed in the creation of a list.');
          // TODO2 Error Handling.
        } */
      });

    };

  });
