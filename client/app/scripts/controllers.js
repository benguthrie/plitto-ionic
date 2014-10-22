'use strict';
angular.module('Plitto.controllers', [])

.run(function($rootScope, dbFactory, $state){
  $rootScope.showList = function(listId, listName, userFilter){
    console.log('global show a list');
    
     // $scope.showAList = function(listId, listName, userFilter){
    // 10/22/2014 -- Build the entries in the rootScope for the list.
    
    dbFactory.showAList(listId, listName, userFilter);
    
    $state.go('app.list',{listId: listId});
    // };
  };
  
  $rootScope.showUser = function(userId, userName, initialView){
    console.log('global: show a user.', $rootScope.vars.user, 'uid: ',userId,' username: ',userName);
    $rootScope.profileData = {
      userName: userName,
      userId: userId,
      lists: [],
      ditto: [],
      feed: []
    };
    
    $rootScope.nav.view = "user.ditto";
    
    dbFactory.showUser(userId);
  };
  
  
  /* TODO This function must be available in may different locations throughout the app */
    $rootScope.ditto = function(mykey, uid, lid, tid, $event,scopeName){
        // console.log('your existing key is: ',mykey, ' from user: ',uid,' from list: ', lid,' and thing: ',tid);
        
        /* update the styles */
        
        
        /* TODO update that record? THERE HAS TO BE A BETTER WAY*/
        var i,j,k;
      
      console.log('scopeName and results: ',scopeName, ' results: ',eval('$rootScope.' + scopeName));
      
        /* TODO1 - Dynamically apply the scope so it's only searching the scope that it could be in. better still, do this as part of the event. 
        findItem:{
            for(i in $rootScope[scopeName]){
                if($rootScope[scopeName][i].uid === uid){
                    for(j in $rootScope[scopeName][i]['lists']){
                        if($rootScope[scopeName][i]['lists'][j].lid === lid){
                            for(k in $rootScope[scopeName][i]['lists'][j]['items']){
                                if($rootScope[scopeName][i]['lists'][j]['items'][k].tid === tid){
                                    // Change the state of this item.
                                    $rootScope[scopeName][i]['lists'][j]['items'][k].mykey = 0;
                                    // There can be only one. So stop once you find it.
                                    break findItem;
                                }
                            }
                        }
                    }
                } 
            }
        } */
        // console.log($rootScope.profileData.feed[0]["lists"
      findItem:{
            for(i in eval('$rootScope.' + scopeName)){
                if(  eval('$rootScope.' + scopeName + '[i].uid') === uid){
                    for(j in eval('$rootScope.' + scopeName + '[i]["lists"]') ){
                        if(  eval('$rootScope.' + scopeName + '[i]["lists"][j].lid')  === lid){
                            for(k in eval('$rootScope.' + scopeName + '[i]["lists"][j]["items"]')  ){
                                if( eval('$rootScope.' + scopeName + '[i]["lists"][j]["items"][k].tid') === tid){
                                    // Change the state of this item.
                                    eval('$rootScope.' + scopeName + '[i]["lists"][j]["items"][k].mykey = 0');
                                    // There can be only one. So stop once you find it.
                                    break findItem;
                                }
                            }
                        }
                    }
                } 
            }
        }
      
        // console.log('final ijk: ',i,j,k);
        
        // Call the ditto in the dbFactory. It will handle the key in the correct scope for styling purposes. 
        /* TODO3 - Review this whole process */
        dbFactory.dbDitto(scopeName,i,j,k,mykey,uid,lid,tid, $event);
        
        
    };
  
}) 

.controller('AppCtrl', function($scope, $state, dbFactory, $rootScope) {
  // Grab the user info here as soon as they login.
  // Global Logout Handler
  $scope.logout = function () {
    // TODO: Make database service call.
    console.log('TODO2: FB Logout call');
  };
    
  $scope.loadLists = function(){
    console.log("You want to load lists");
    dbFactory.getUserListOfLists($rootScope.vars.user.userId);
  };
    
})

.controller('HomeCtrl',function($scope, $rootScope,dbFactory) {
  
    
   
    
    $scope.getMore = function(){
        dbFactory.dbGetSome($scope, '', '');
    };
    
})

.controller('ProfileCtrl', function($scope,dbFactory) {
  console.log("Profile Control",$scope);
  $scope.showFeed = function(userId, oldestItem){
    console.log('profile show feed: ',userId, ' oldest: ',oldestItem);
    // showFeed = function(theType, userFilter, listFilter, myState, oldestKey)
    dbFactory.showFeed('profile',userId,'','','');
  }; 
  
  $scope.getSome = function(userId){
    console.log("Get Some for userid: ",userId);
    dbFactory.dbGetSome('profile',userId,'');
  };
  
  
  
})

.controller('FriendsCtrl', function($scope, $rootScope) {
  console.log("You have tried to control your friends",$rootScope.friendStore);
})

.controller('FriendCtrl', function($scope, $rootScope) {
    console.log("You clicked on a friend.");  
})

/* 10/21/2014 - Added RootScope to populate the list with? TODO1 - Build lists from $rootScope.lists */
.controller('ListsCtrl', function($scope, $ionicModal, $ionicActionSheet,$rootScope, dbFactory,$state) {
  // Initialize variablse
  $scope.newList = {};
  $scope.modal = null;
  
  
  $scope.loadLists = function(){
    console.log("Load Lists - Could also refresh.");
    dbFactory.getUserListOfLists($rootScope.vars.user.userId);
  };
  
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
    
      dbFactory.newList($scope.newList.title, function(newListId, listName){ 
        // console.log('the list creation was successful', newListId, listName);
       /*
        $state.go('app.list', {
          url: '/list/:listId',
          views: {
            'menuContent': {
              templateUrl: 'templates/list.html',
              controller: 'ListCtrl'
            }
          }
        });
        */
        dbFactory.showAList(newListId);
        
        $state.go('app.list',{listId: newListId});
        
      }, function(){console.log('the list creation failed.'); });
      
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

.controller('ListCtrl', function($scope, $stateParams, $rootScope, dbFactory) {
  $scope.listId = $stateParams.listId;

  $scope.newItem = {theValue: null};
  
  $scope.addToList = function(newItem){
    // console.log('submit to the list: ',newItem, 'newItemForm: ',$scope.newItemForm, ' scope: ',$scope,'Scope new Item: ',$scope.newItem);
    
    var itemObj = {lid: $stateParams.listId, thingName: newItem};
    
    $scope.newItem = {theValue: null};
    
    dbFactory.addToList(itemObj);
  };
  
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
