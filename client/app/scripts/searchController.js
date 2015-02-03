'use strict';
angular.module('searchController', [])
  .controller('SearchCtrl', function ($scope, $stateParams, dbFactory, $state) {

    /* Clear out the last search */
    $scope.search = {
      term: $stateParams.term,
      results: []
    };

    /* Clear the Search */
    $scope.emptyTheSearch = function () {
      // console.log('clear Search');
      $scope.search = {
        term: null,
        results: []
      };
      var elementToFocusOn = document.querySelector('input#searchField');
      // TODO2 - Focus on search in app on click. console.log('focus on: ', elementToFocusOn);
    };

    $scope.searchFor = function (searchTerm, searchType) {
      // console.log('this could be deleted. The whole function. 1/27/2015');
    };

    /* List */
    $scope.showList = function (listId, listName, userFilter, focusTarget) {
      // console.log('showList controllers.js 383');
      // dbFactory.showAList(listId, listName, userFilter);
      $state.go('app.list', {
        listId: listId
      });
    };

    /* Thing */
    $scope.showThing = function (thingId, thingName, userFilter) {
      // dbFactory.showThing( thingId, thingName, userFilter );
      $state.go('app.thing', {
        thingId: thingId
      });
    };

    // Initialize a new search.
    $scope.$watch(function () {
      // console.log('search watch found', $scope.search.term );
      return $scope.search.term;
    }, function (newValue, oldValue) {
      // console.log('TODO2 - This is where oldValue is used: ' + oldValue + ' to ' + newValue);
      if (typeof newValue !== 'undefined' && newValue !== oldValue) {

        dbFactory.promiseSearch(newValue, 'general').then(function (d) {

          $scope.search.results = d.results;
        });

      }
    });
  });