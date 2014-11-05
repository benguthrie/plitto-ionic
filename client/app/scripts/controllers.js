'use strict';
angular.module('Plitto.controllers', [])

.run(function($rootScope, dbFactory, $state, localStorageService, $ionicModal ){
  
   console.log('line 6');  
  
  // At first, initialize the rootScope.
  dbFactory.dbInit();
  
  // Start by seeing if a user is logged in. TODO1 - This should be done on 10/23.
  if(!$rootScope.token){
    // See if it's in the local storage.
    if(localStorageService.get('token')){
      console.log("There was a token in the local storage.");
      console.log("BUT IS IT VALID?!?!?!? TODO1 - Only apply the token if it's a valid one.");
      // Set the token.
      $rootScope.token = localStorageService.get('token');
      
      
      
      // This should only happen when the app loads, and at specific times, so we'll build everything back up in dbFactory
      dbFactory.refreshData($rootScope.token);
      
    } else {
      console.log("No token in local storage.");
    //  
    }
  }
/*  
  $ionicModal.fromTemplateUrl('templates/modals/loading.html', {
    scope: $rootScope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
*/
  $rootScope.debug = function(message) {
    
    if(typeof($rootScope.message) === 'string' && $rootScope.message.length > 255){
      $rootScope.message = 'cleared';
    }
    
    if($rootScope.debugOn === true){
      if(typeof (message) ==='string'){
        console.log(message);
        $rootScope.message = $rootScope.message + " | " + message;
      } else {
        console.log('message is not a string', message);
      }
    }
  };
  
  
  
  
  
}) 
.controller('AppCtrl', function($scope, $state, dbFactory, $rootScope, localStorageService,Facebook,$ionicViewService) {

  // On load, load the correct interface
  // console.log('$rootScope.token onload action: ', $rootScope.token);
  $rootScope.debug('AppCtrl load: Token: ' + $rootScope.token );
  if(typeof ($rootScope.token) === 'string' && $rootScope.token ==='loading'){
    console.log('initial: loading');
    $rootScope.debug('Appctrl - 179 Rootscope is loading.');
    $state.go('loading');
  } else if (typeof ($rootScope.token) === 'string' && $rootScope.token.length > 0){
    // We will assume that the token is valid TODO1 - Test it.
    $rootScope.debug('Appctrl - 183 Loading because the token looks good.');
    $state.go('app.home'); // TODO1 - Diego - Should this be moved? - Not working!
    $ionicViewService.clearHistory();
    // $location.path('/login');
  } else {
    console.log('initial: null?');
    $rootScope.debug('Appctrl - 189 Rootscope is null?');
    $state.go('login');
  }
  
  $scope.deleteFBaccess = function() {
    console.log('deleteFBaccess in loginctrl');
    Facebook.unsubscribe();
  };
  
  // This is for the logged in user
  $scope.showUser = function(userId, userName, dataScope){
    
    dbFactory.showUser(userId,userName, dataScope);
  };
  
  
  // Grab the user info here as soon as they login.
  
  $scope.login = function () {
    $rootScope.debug('Appctrl - controllers AppCtrl.login() pressed.');
    Oauth.login();
  };
  
  // Global Logout Handler
  $scope.logout = function () {
    // TODO: Make database service call.
    
    $rootScope.debug('Appctrl - TODO2: FB Logout call.');
    // $state.go('app.login',{listId: newListId});
    Facebook.logout();
    
    // Clear all the stores.
    dbFactory.dbInit();
    localStorageService.clearAll();
    // $rootScope.debug('clear rootScope. Rootscope: ' + JSON.stringify($rootScope));
    
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
    $rootScope.debug("AppCtrl You want to load lists into your profile.");
    // dbFactory.getUserListOfLists($rootScope.vars.user.userId);
    dbFactory.getUserListOfLists($rootScope.user.userId , '$rootScope.lists');
  };
  
    
})

  .controller('ThingCtrl',function($scope, $rootScope,dbFactory) {
    // Control for thing goes here.
     

  })
  .controller('LoadingCtrl',function($scope, $state, $rootScope, dbFactory) {
    // Control for thing goes here.
    $scope.thetoken = $rootScope.token;
    $rootScope.debug("loadingctrl loaded");
  
    /* When this screen loads, if there is a token, go home. */
    if(typeof $rootScope.token === 'string' && $rootScope.token !== 'loading'){
      console.log('Loading, go home!');
      $state.go('app.home');
    }
     
    $scope.showToken = function(){
      $rootScope.debug("LoadingCtrl showToken");
      
      $scope.thetoken = $rootScope.token;
    }
    
    $scope.clearToken = function(){
      $rootScope.debug("LoadingCtrl clearToken");
      $rootScope.token = '';

      $scope.thetoken = 'cleared!';
    }
    
    $scope.setToken = function(){W
      $rootScope.debug("LoadingCtrl setToken to 35358a19f081483800da33f59635e86f");
      $rootScope.token = '35358a19f081483800da33f59635e86f';
      $scope.thetoken = '35358a19f081483800da33f59635e86f';
    }
    

  })

.controller('HomeCtrl',function($scope, $rootScope,dbFactory) {
  console.log('initiate home control');
  $scope.testFunction = function(){
    console.log('test function clicked.');
  };
  

  $scope.getSome = function(){
      $rootScope.bite = [];
    $scope.bite = 'this was reloaded';
      // dbGetSome = function (theScope, userfilter, listfilter, sharedFilter)
      dbFactory.dbGetSome('$rootScope.bite', '', '', 'ditto');
  };

})

.controller('DebugCtrl', function($scope,dbFactory, $rootScope) {
  $scope.loadList = function(type){
    $rootScope.debug("DebugCtrl DEBUG loadList TYPE: " +type);
    
    var listId = 231; // Movies I've seen.
    // loadList = function(listNameId, listName, userIdFilter, type, sharedFilter, oldestKey){
    var userIdFilter = ''; // Defaults to no filter.
    // var type = 'all'; // This is the initial load. other options: 'feed','shared','ditto','strangers','all'
    var sharedFilter = ''; // option to show shared / dittoable / all 
    var oldestKey = 0; // Option is to show only items older than the one there.
    dbFactory.loadList(listId, 'Products on My Radar', userIdFilter, type, sharedFilter, oldestKey);
  };
  
  $scope.debugCtrl = function(state){
    $rootScope.debugOn = state;
    $rootScope.debug("Debug now: " +state);
  }
  
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
  
  $scope.getSome = function(userId, filter){
    // console.log("Get Some for userid: ",userId);
    // dbGetSome = function (theScope, userfilter, listfilter, sharedFilter)
    dbFactory.dbGetSome('$rootScope.profileData.'+filter, userId, '', filter);
  };
  
  $scope.showLists = function(userId){
    dbFactory.getUserListOfLists(userId, '$rootScope.profileData.lists');
  };
  
  $scope.makeActive = function(){
    console.log('make active');
  };
})

.controller('SearchCtrl', function($scope, $rootScope,$stateParams, dbFactory) {
  console.log("You have entered Search");

  $scope.search = {term: $stateParams.term, results: []};

  /* List */
  $scope.showList = function(listId, listName, userFilter){
    dbFactory.showAList(listId, listName, userFilter);
  };

  /* Thing */
  $scope.showThing = function(thingId, thingName, userFilter){
    dbFactory.showThing(thingId, thingName, userFilter);
  };
  
  // Initialize a new search.
  
  $scope.$watch(function(){
    
    return $scope.search.term;
  }, function(newValue, oldValue){
    console.log("Changed from " + oldValue + " to " + newValue);
    if(typeof newValue !== 'undefined' && newValue.length > 0){
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
.controller('ListsCtrl', function($scope, $rootScope, dbFactory,$state, $ionicActionSheet ) {
 
  $scope.loadLists = function(){
   // user.userId is hard coded in lists, because it's always going to be this user's lists.
    dbFactory.getUserListOfLists($rootScope.user.userId,'$rootScope.lists');
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
  
  $scope.navView = 'ditto';

  $scope.view = function(theView){
    // if it's already active, then make the call.
    console.log('pressed view. ', theView);
    if(theView === $rootScope.nav.listView){
      console.log('make the call');
      dbFactory.loadList($stateParams.listId, '', '', theView, '', '');
    }
    
    $rootScope.nav.listView = theView;
  }
  
  $scope.newItem = {theValue: null};
  
  $scope.addToList = function(newItem){
    // console.log('submit to the list: ',newItem, 'newItemForm: ',$scope.newItemForm, ' scope: ',$scope,'Scope new Item: ',$scope.newItem);
    // Make the active view my list, so I can see it.
    $rootScope.nav.listView = 'mine';
    
    var itemObj = {lid: $stateParams.listId, thingName: newItem};
    
    $scope.newItem = {theValue: null};
    
    dbFactory.addToList(itemObj);
  };
  
})

.controller('LoginCtrl', function($scope, $window, $rootScope, $state, OAuth) {
  /* 
  $scope.force = function(){
    $rootScope.token = 'ae6d5d593f59d15652109f88edaea72a'; 
  };
  */
  
  
  
  $scope.loginOAuth = function(provider) {
    $rootScope.message = "<h3>1. loginOAuth Pressed</h3>";
    
    // TODO1 - This is the bit that handles the login.
    if(provider === 'facebook'){
      // Do that.
      
      $rootScope.message = "<h3>2. Call OAuth.login</h3>";
      // 
      OAuth.login('facebook');
      
      $state.go('loading');      // TODO 1 - Is this working?
      // Facebook.login();
      
      
    } else {
      $rootScope.message = "<h3>2. END - Unknown Provider</h3>";
      
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
