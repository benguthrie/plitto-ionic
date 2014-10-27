'use strict';
angular.module('Plitto.controllers', [])

.run(function($rootScope, dbFactory, $state, localStorageService ){
  
   console.log('line 6');
  
  // Start by seeing if a user is logged in. TODO1 - This should be done on 10/23.
  if(!$rootScope.token){
    // See if it's in the local storage.
    if(localStorageService.get('token')){
      console.log("There was a token in the local storage.");
      console.log("BUT IS IT VALID?!?!?!? TODO1 - Only apply the token if it's a valid one.");
    } else {
      console.log("No token in local storage.");
    //  
    }
  }
 
  $rootScope.showList = function(listId, listName, userFilter){
    console.log('global show a list');
    
     // $scope.showAList = function(listId, listName, userFilter){
    // 10/22/2014 -- Build the entries in the rootScope for the list.
    
    dbFactory.showAList(listId, listName, userFilter);
    
    $state.go('app.list',{listId: listId});
    // };
  };
  
  $rootScope.showThing = function(thingId, thingName, userFilter){
    console.log('global show a thing');
    
     // $scope.showAList = function(listId, listName, userFilter){
    // 10/22/2014 -- Build the entries in the rootScope for the list.
    
    $rootScope.thingData = {thingId: thingId, thingName: thingName, items: []};
    
    dbFactory.showThing(thingId, thingName, userFilter);
    
    $state.go('app.thing',{thingId: thingId});
    // };
  };
  
  // Initialize the content
  $rootScope.init = function(){
     $rootScope.modal = {
		show: false,
		type: null,
		id: null,
		listStore: [],
		friendStore: [],
		thingStore: [],
		header: null
	};

	/* End if life in the future. It leads to scope bloat */
	$rootScope.vars = { };
	$rootScope.vars.user = { userId: 0};
	$rootScope.vars.message = '';
    
    $rootScope.token = null;
    
	$rootScope.vars.temp = {};
	$rootScope.listStore = [];
	$rootScope.friendStore = [];

	// 8/26/2014 New Navigation Vars
	$rootScope.nav = {
		
	};

	$rootScope.session = {
		fbAuth: null,
		fbState: 'disconnected',
		plittoState: null
	};
    
    $rootScope.profileData = {
      lists: [],
      userId: null,
      feed: [],
      ditto: []
    };
      
  };
  
  $rootScope.showUser = function(userId, userName, dataScope){
    // console.log('global: show a user.', $rootScope.vars.user, 'uid: ',userId,' username: ',userName);
    $rootScope.profileData = {
      userName: userName,
      userId: userId,
      lists: [],
      ditto: [],
      feed: []
    };
    
    $rootScope.nav.view = "user.ditto";
    
    // dbFactory.showUser(userId);
    // dbGetSome = function(thescope, userfilter, listfilter){
    dbFactory.dbGetSome('$rootScope.profileData.ditto', userId, '');
    dbFactory.getUserListOfLists(userId, '$rootScope.profileData.lists');
  };
  
  
  /* TODO This function must be available in may different locations throughout the app */
    $rootScope.ditto = function(mykey, uid, lid, tid, $event,scopeName){
        // console.log('your existing key is: ',mykey, ' from user: ',uid,' from list: ', lid,' and thing: ',tid);

        
        
        /* Trach which record we're updating. Direct key would be preferable to looping through any portion of the rootscope.. */
        var i,j,k;
      
      // console.log('scopeName and results: ',scopeName, ' results: ',eval('$rootScope.' + scopeName));
      
       
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

.controller('AppCtrl', function($scope, $state, dbFactory, $rootScope, localStorageService,Facebook) {
  // Grab the user info here as soon as they login.
  
  
  // Global Logout Handler
  $scope.logout = function () {
    // TODO: Make database service call.
    console.log('TODO2: FB Logout call');
    // $state.go('app.login',{listId: newListId});
    Facebook.logout();
    
    // Clear all the stores.
    $rootScope.init();
    localStorageService.clearAll();
    console.log("$rootScope",$rootScope);
    
    // Clear local storage
    
    $state.go('login');
    /*
    
    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl'
    })
    */
  };
    
  $scope.loadLists = function(){
    console.log("You want to load lists into your profile.");
    // dbFactory.getUserListOfLists($rootScope.vars.user.userId);
    dbFactory.getUserListOfLists($rootScope.vars.user.userId , '$rootScope.lists');
  };
    
})

  .controller('ThingCtrl',function($scope, $rootScope,dbFactory) {
    // Control for thing goes here.
     

  })

  .controller('HomeCtrl',function($scope, $rootScope,dbFactory) {

      $scope.getMore = function(){
          $rootScope.bite = [];
          dbFactory.dbGetSome('$rootScope.bite', '', '');
      };

  })


.controller('DebugCtrl', function($scope,dbFactory, $rootScope) {
  $scope.debugLog = [{startItem: 'this is the start item'}];
  
 
  
  $scope.testString = function(){
    $scope.debugLog = "string";
  };
  
  $scope.testObj = function(){
    $scope.debugLog = JSON.stringify([{item: 'this is a test item'}]);
  };
  
  $scope.rootScopePart = function(part){
    $scope.debugLog = JSON.stringify(eval('$rootScope.' + part));
  };
  
})

.controller('ProfileCtrl', function($scope,dbFactory) {
  // console.log("Profile Control",$scope);
  $scope.showFeed = function(userId, oldestItem){
    // 
    console.log('profile show feed: ',userId, ' oldest: ',oldestItem);
    // showFeed = function(theType, userFilter, listFilter, myState, oldestKey)
    dbFactory.showFeed('profile',userId,'','','');
  }; 
  
  $scope.getSome = function(userId){
    // console.log("Get Some for userid: ",userId);
    dbFactory.dbGetSome('$rootScope.profileData.ditto',userId,'');
  };
  
  $scope.showLists = function(userId){
    dbFactory.getUserListOfLists(userId, '$rootScope.profileData.lists');
  };
  
  
})

.controller('SearchCtrl', function($scope, $rootScope,$stateParams, dbFactory) {
  console.log("You have entered Search");

  $scope.search = {term: $stateParams.term, results: []};
  
  // Initialize a new search.
  
  $scope.$watch(function(){
    
    return $scope.search.term;
  }, function(newValue, oldValue){
    console.log("Changed from " + oldValue + " to " + newValue);
    if(newValue.length !==0){
      dbFactory.search(newValue);
    }
  });
/*  */  
})
.controller('FriendsCtrl', function($scope, $rootScope) {
  // console.log("You have tried to control your friends",$rootScope.friendStore);
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
   //  console.log("Load Lists - Could also refresh.");
    dbFactory.getUserListOfLists($rootScope.vars.user.userId,'$rootScope.lists');
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

.controller('LoginCtrl', function($scope, $window, Facebook) {
  $scope.loginOAuth = function(provider) {
    // TODO1 - This is the bit that handles the login.
    if(provider === 'facebook'){
      // Do that.
      $scope.message = "Logging in with Facebook";
      // 
      Facebook.login();
      
      
    } else {
      console.log("You tried to log in with another provider");
    }
    // $window.location.href = '/auth/' + provider;
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
