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

  // Handle authService events from `angular-http-auth`
  $scope.$on('event:auth-loginRequired', function (response) {
    $state.go('login');
  })
  $scope.$on('event:auth-loginConfirmed', function (response, user) {
    console.log('success');
  });
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
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
  $state.go('app.playlists');
});
