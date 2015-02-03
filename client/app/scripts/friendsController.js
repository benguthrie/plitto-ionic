'use strict';
angular.module('friendsController', [])
  .controller('FriendsCtrl', function (dbFactory, $scope, localStorageService, pltf, $rootScope) {

    /* First - Load from Local Storage */
    $scope.friendStore = localStorageService.get('friendStore');
    // console.log('Friends Ctrl initiated');

    dbFactory.friendsList().then(function (d) {
      // console.log('dfriendsStore', d);
      $scope.friendStore = d;
      localStorageService.set('friendStore', d);
    });

    /* Second - Load from the api */
    $scope.reloadFriends = function () {
      // TODO1 - From pull down? Do this as part of the sorting options.
    };
  });