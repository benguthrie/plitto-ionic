'use strict';
angular.module('Plitto.controllers', [])

.controller('AppCtrl', function($scope, $state, LoopBackAuth, User) {
  // Grab the user info here as soon as they login.
  User.identities({id: LoopBackAuth.currentUserId},
  function(identities) {
    console.log("success", identities);
    // Only need facebook-login info
    $scope.userIdentity = _.find(identities, function(identity) {
      return identity.provider === 'facebook-login';
    });
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

.controller('ProfileCtrl', function($scope) {
})

.controller('ListsCtrl', function($scope, $ionicModal, $ionicActionSheet, LoopBackAuth, User) {
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
  User.lists({ id: LoopBackAuth.currentUserId },
    function(lists) {
      $scope.lists = lists;
    }, function(err) {
      console.log('fail', err);
    });

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
    User.lists.create({ id: LoopBackAuth.currentUserId },
      $scope.newList,
      function(list) {
      $scope.lists.push(list);
      $scope.newList = {};
      $scope.closeModal();
    }, function (err) {
      console.log('fail', err);
    });
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
        User.lists.destroyById({
          id: list.userId,
          fk: list.id
        }, function(deletedList) {
          _.remove($scope.lists, list);
        }, function(err) {
          console.log('fail', err);
        });
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
});
