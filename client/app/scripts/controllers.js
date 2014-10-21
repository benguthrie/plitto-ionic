'use strict';
angular.module('Plitto.controllers', [])

.controller('AppCtrl', function($scope, $state) {
  // Grab the user info here as soon as they login.
  // TODO: Make database service call.

  // Global Logout Handler
  $scope.logout = function () {
    // TODO: Make database service call.
    console.log('TODO: FB Logout call');
  };
})

.controller('HomeCtrl', function($scope) {
  // TODO: Make call and print it out here.
})

.controller('ProfileCtrl', function($scope) {
})

.controller('ListsCtrl', function($scope, $ionicModal, $ionicActionSheet) {
  // Initialize variablse
  $scope.newList = {};
  $scope.modal = null;
  $ionicModal.fromTemplateUrl('templates/modals/add-list.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // TODO: Make database service call to populate lists
  $scope.lists = [
    { title: 'Test', id: 2 }
  ];

  // Launch add-list modal
  $scope.addListModal = function () {
    $scope.modal.show();
  };

  // Close add-list modal
  $scope.closeModal = function () {
    $scope.modal.hide();
  };

  // Create a new list
  $scope.createList = function () {
    // TODO: Make database service call.
  };

  // Delete a list
  $scope.deleteList = function (list) {
    $ionicActionSheet.show({
      destructiveText: 'Delete',
      titleText: 'Are you sure you want to delete this list?',
      cancelText: 'Cancel',
      cancel: function () {
        console.log('Cancelled');
      },
      destructiveButtonClicked: function () {
        // TODO: Make database service call.
        return true;
      }
    });
  };
})

.controller('ListCtrl', function($scope, $stateParams) {
})

.controller('LoginCtrl', function($scope, $window) {
  $scope.loginOAuth = function(provider) {
    $window.location.href = '/auth/' + provider;
  };
})

/*
.controller('LoginCallbackCtrl', function($scope, $state, $stateParams, $ionicViewService, LoopBackAuth) {
  LoopBackAuth.accessTokenId = $stateParams.access_token;
  LoopBackAuth.currentUserId = $stateParams.userId;
  LoopBackAuth.rememberMe = true; // Force save to LocalStorage
  LoopBackAuth.save();
  $ionicViewService.nextViewOptions({
    disableAnimate: true,
    disableBack: true
  });
  $state.go('app.lists');
});*/
