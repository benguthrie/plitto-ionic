'use strict';
angular.module('homeController', [])

.controller('HomeCtrl', function ($scope, dbFactory, $interval, localStorageService) {
  /* TODO2 Add Timers
  $scope.timers = {
    friendsLoad: 0,
    strangersLoad: 0,
    friendsGet: 0,
    strangersGet: 0
  };


  $interval(function () {
    $scope.testTime++;
  }, 10);
  */
  $scope.store = {
    'friends': [{
      loading: true,
      loadingTime: 0
    }],
    'strangers': [{
      loading: true,
      loadingTime: 0
    }]
  };

  // Creat the intervalTimer, so we can kill it later
  // TODO2 $scope.intervalTimer = null;

  // Load up some content for both views
  // LOAD FRIENDS
  if ($scope.store.friends[0].loading || $scope.store.friends[0].length === 0) {
    // First, load from local storage, if it's there.
    if (localStorageService.get('bitefriends')) {
      $scope.store.friends = localStorageService.get('bitefriends');
    } else {
      // Empty whatever's in the scope
      $scope.store.friends = [];

      /* // TODO2 
      $scope.intervalTimerFL = $interval(function () {
        // Build in a self destruct.
        if ($scope.timers.friendsLoad > 1000) {
          $interval.cancel($scope.intervalTimerFL);
          $scope.intervalTimerFL = null;
        }
        $scope.timers.friendsLoad++;
      }, 10);
      */

      dbFactory.promiseGetSome('friends', '', 'ditto').then(function (d) {


        $scope.store.strangers = d;
        // End the timer
        // TODO2 $interval.cancel($scope.intervalTimerFL);
        // TODO2 $scope.intervalTimerFL = null;

      });
    }


  }

  if ($scope.store.strangers[0].loading || $scope.store.strangers[0].length === 0) {
    // First, load from local storage, if it's there.
    if (localStorageService.get('bitestrangers')) {
      $scope.store.strangers = localStorageService.get('bitestrangers');
    } else {
      /*
            $scope.intervalTimerSL = $interval(function () {
              // Build in a self destruct.
              if ($scope.timers.strangersLoad > 1000) {
                $interval.cancel($scope.intervalTimerSL);
                $scope.intervalTimerSL = null;
              }
              $scope.timers.strangersLoadLoad++;
            }, 10);
      */
      dbFactory.promiseGetSome('strangers', '', 'ditto').then(function (d) {

        $scope.store.strangers = []; // Remove the timer.
        $scope.store.strangers = d;
        // End the timer
        // TODO2 $interval.cancel($scope.intervalTimerSL);
        // TODO2 $scope.intervalTimerSL = null;

      });
    }

  }

  $scope.view = 'friends';

  $scope.getSome = function (typeFilter) {
    console.log('typeFilter: ', typeFilter);
    // TODO2 $scope.timers[typeFilter + 'Get'] = 0;
    // dbGetSome = function (theScope, userfilter, listfilter, sharedFilter)
    if ($scope.view === typeFilter || typeof ($scope.store[typeFilter][0].uid) === 'undefined') {
      $scope.view = typeFilter;
      // They already are on this view, so reload it, or the view is undefined. 


      $scope.store[typeFilter] = [{
        loading: true,
        loadingTime: 0
      }];

      // Start the timer
      /* TODO2 
            $scope['intervalTimer' + typeFilter] = $interval(function () {
              // Build in a self destruct.
              if ($scope.timers[typeFilter + 'Get'] > 1000) {
                $interval.cancel($scope['intervalTimer' + typeFilter]);
                $scope['intervalTimer' + typeFilter] = null;
              }
              $scope.timers[typeFilter + 'Get'] ++;
            }, 10);
      */

      dbFactory.promiseGetSome(typeFilter, '', 'ditto').then(function (d) {

        // Load the data, overwriting the timer and loading parameter
        $scope.store[typeFilter] = d;
        // TODO2       $interval.cancel($scope.intervalTimer);
        // TODO2 $scope.intervalTimer = null;

      });

      // Stopethe timer
      // This doesn't allow it to ever work. $interval.cancel($scope.intervalTimer);
      // TODO2 $scope.intervalTimer = null;
      /*
            if ($scope.timers[typeFilter] > 100) {
              $scope.store[typeFilter] = {
                error: true,
                errorText: 'loadingTimedOut'
              };
              $interval.cancel($scope.intervalTimer);
              $scope.intervalTimer = null;
              */
      // return true;
      // }

    } else {
      $scope.view = typeFilter;
    }



  };

});