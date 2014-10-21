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

.controller('HomeCtrl',function($scope, $rootScope,dbFactory) {
  // TODO: Make call and print it out here.
  console.log($rootScope.bite);

    /* TODO This function must be available in may different locations throughout the app */
    $scope.ditto = function(mykey, uid, lid, tid, $event){
        console.log('your existing key is: ',mykey, ' from user: ',uid,' from list: ', lid,' and thing: ',tid);
        
        /* update the styles */
        
        
        /* TODO update that record? THERE HAS TO BE A BETTER WAY*/
        var i,j,k;
        
        /* Make it pending */
        findItem:{
            for(i in $rootScope.bite){
                if($rootScope.bite[i].uid === uid){
                    for(j in $rootScope.bite[i]['lists']){
                        if($rootScope.bite[i]['lists'][j].lid === lid){
                            for(k in $rootScope.bite[i]['lists'][j]['items']){
                                if($rootScope.bite[i]['lists'][j]['items'][k].tid === tid){
                                    // Change the state of this item.
                                    $rootScope.bite[i]['lists'][j]['items'][k].mykey = 0;
                                    // There can be only one. So stop once you find it.
                                    break findItem;
                                }
                            }
                        }
                    }
                } 
            }
        }
        
        console.log('final ijk: ',i,j,k);
        
        // Call the ditto in the dbFactory. It will handle the key in the correct scope for styling purposes. 
        /* TODO3 - Review this whole process */
        dbFactory.dbDitto('bite',i,j,k,mykey,uid,lid,tid, $event);
        
        
    };
    
    $scope.getMore = function(){
        dbFactory.dbGetSome($scope, '', '');
    };
    
})

.controller('ProfileCtrl', function($scope) {
})

.controller('FriendsCtrl', function($scope, $rootScope) {
  console.log("You have tried to controll your friends",$rootScope.friendStore);
})

.controller('FriendCtrl', function($scope, $rootScope) {
    console.log("You clicked on a friend.");  
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
