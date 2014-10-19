'use strict';
angular.module('Plitto.controllers', [])

.controller('AppCtrl', function($scope, $state, LoopBackAuth, User) {
  // Grab the user info here as soon as they login.
  User.identities({id: LoopBackAuth.currentUserId},
  function(identities) {
    console.log("success", identities);
    // TODO: Pick only `facebook-login`
  },
  function(err) {
    console.log("fail", err);
  });

  // Global Logout Handler
  $scope.logout = function () {
    console.log('logging out');
    User.logout(function(user) {
      $state.go('login');
    }, function (err) {
      console.log("fail", err);
    });
  };
})

.controller('ListsCtrl', function($scope) {
  $scope.lists = [
    { title: 'Programming', id: 1 },
    { title: 'Wakeboarding', id: 2 },
    { title: 'Startups', id: 3 },
    { title: 'Chasing $$ signs', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Watching the Cowboys lose', id: 6 }
  ];
})

.controller('ListCtrl', function($scope, $stateParams) {
})

.controller('LoginCtrl', function($scope, $window) {
  $scope.loginOAuth = function(provider) {
    $window.location.href = '/auth/' + provider;
  };
})

.controller('LoginCallbackCtrl', function($scope, $state, $stateParams, LoopBackAuth) {
  LoopBackAuth.accessTokenId = $stateParams.access_token;
  LoopBackAuth.currentUserId = $stateParams.userId;
  LoopBackAuth.rememberMe = true; // Force save to LocalStorage
  LoopBackAuth.save();
  $state.go('app.lists');
});
