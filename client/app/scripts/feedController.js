'use strict';
angular.module('feedContrller', [])
  .controller('FeedCtrl', function ($scope, dbFactory, localStorageService) {

    // On load, open friends.
    $scope.view = 'friends';
    $scope.store = {
      friends: [{
        loading: true
    }],
      strangers: [{
        loading: true
    }]
    };

    // Populate the feeds on load
    if ($scope.store.friends.length === 0 || $scope.store.friends[0].loading === true) {
      if (localStorageService.get('feedFriends')) {
        $scope.store.friends = localStorageService.get('feedFriends');
      }

      $scope.store.friends[0] = {
        loading: true
      };
      dbFactory.promiseFeed('friends', '', '', '', '', '').then(function (d) {
        $scope.store[d.type] = d.results;
      });
    }

    // Populate the feeds on load
    if ($scope.store.strangers.length === 0 || $scope.store.strangers[0].loading === true) {

      if (localStorageService.get('feedStrangers')) {
        $scope.store.strangers = localStorageService.get('feedStrangers');
      }

      $scope.store.strangers[0] = {
        loading: true
      };

      dbFactory.promiseFeed('strangers', '', '', '', '', '').then(function (d) {
        $scope.store[d.type] = d.results;

      });
    }

    // var mainFeed = function (theType, continueFrom, userFilter, listFilter, sharedFilter, scopeName, newerOrOlder){
    // dbFactory.mainFeed('friends', '', '', '', '', 'feed.friends',''); // Should only evaluate when navigating to "feed"

    $scope.feed = function (filter, continueFrom, newerOrOlder) {
      console.log('newOrOlder and continueFrom just to use it' + newerOrOlder + continueFrom);
      if (filter === $scope.view) {
        /* Refresh */
        $scope.store[filter] = [{
          loading: true
      }];
        dbFactory.promiseFeed(filter, '', '', '', '', '').then(function (d) {
          $scope.store[filter] = d.results;
        });
      }
      // Set the active view.
      $scope.view = filter;
    };
  });
