angular.module('homeController', [])

.controller('HomeCtrl', function ($scope, $rootScope, dbFactory, pltf) {

  $scope.store = {
    'friends': [{
      loading: true
    }],
    'strangers': [{
      loading: true
    }]
  };

  // Load up some content for both views
  if ($scope.store.friends[0].loading || $scope.store.friends[0].length === 0) {
    dbFactory.promiseGetSome('friends', '', 'ditto').then(function (d) {
      $scope.store.friends = d;
    });
  }
  if ($scope.store.strangers[0].loading || $scope.store.strangers[0].length === 0) {
    dbFactory.promiseGetSome('strangers', '', 'ditto').then(function (d) {
      $scope.store.strangers = d;
    });
  }

  $scope.view = 'friends';

  $scope.getSome = function (typeFilter) {

    // dbGetSome = function (theScope, userfilter, listfilter, sharedFilter)
    if ($scope.view === typeFilter) {
      dbFactory.promiseGetSome(typeFilter, '', 'ditto').then(function (d) {
        // console.log('d: ', d);

        $scope.store[typeFilter] = d;

        // con
      });
    } else {
      $scope.view = typeFilter;
    }



  };

})