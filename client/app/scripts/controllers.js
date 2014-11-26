'use strict';
angular.module('Plitto.controllers', [])

.run(function($rootScope, dbFactory, $state, localStorageService, $ionicModal, $location , OAuth){
  
  /* Control all the login and redirect functions */
  $rootScope.$on('broadcast', function (event, args){
    console.log('heard command');
    
    
    console.log('command event: ', event, 'args: ', args);
    
    console.log("Debug message: ", args.debug);
    
    if(args.command === "login"){
      if(args.platform === "facebook")
      {
        console.log("login with facebook");
        OAuth.login('facebook');
      }
    }
    
    else if (args.command === "redirect" )
    {
      console.log('args.redirect, args.path:  ', args.path );
      // TODO1 - Restore this .
      window.location = args.path;
    }
    
    else if (args.command === "state"){
      console.log( "$state.go, args.path: ", args.path );
      // TODO1 - This is not working for the loading page.
      // TODO1 - Restore this . 
      $state.go(args.path);
      // $state.go("app.home");
      // $state.go("app.debug");
    }
    
  });
  
  
  // Prepare the success callback.
/*  
  // watch for fblogin update. Should watch from the full app. broadcast sends this here.
  $rootScope.$on('getLoginStatus', function(event, args){
    $rootScope.message = "got request to login you in at getLoginStatus";
    
    console.log('event: ', event, ' and args: ', args);
    
   //      console.log('typeof fbresponse.status', typeof args.fbresponse.status);
    if(args.fbresponse === null){
      // Nothing. this was a clearing deal.
    } else {
       if(args.fbresponse !== null 
       && args.fbresponse.status !== "unknown"
       && typeof args.fbresponse.authResponse.accessToken === 'string' )
      {
        console.log('step 1', args.fbresponse);
        // $rootScope.$broadcast('getLoginStatus', {fbresponse: 'test'});
        console.log('controllers.appctrl. getLoginStatus got an access token from Facebook. Log into Plitto.');
        dbFactory.fbTokenLogin(args.fbresponse.authResponse.accessToken);
      } 
      // anything from here down will need a response with a status.
      else if (
        typeof args === "object" 
        && typeof args.fbresponse.status === "string" // This should be an object.
        && args.fbresponse.status === "unknown"
      ) {
        $rootScope.message = "Redirect to Facebook for login from controllers37"; 
        // Here, we build the URL that we need the user to go to. 
        if (document.location.hostname == "localhost"){
          var redirect_uri = "http://localhost/plitto-ionic/client/app/";
        } else {
          var redirect_uri = "http://plitto.com/client/app/";
        }
          
        var fbAuthUrl = 'https://www.facebook.com/dialog/oauth?client_id=207184820755&redirect_uri=' + redirect_uri;
        
        // 
        
        console.log('controller.36', redirect_uri);
        window.location = fbAuthUrl;
        // OAuth.login('facebook'); 
        // pFb.login();
        
//        if(typeof args.fbresponse.status !== "undefined"){
//          if(args.fbresponse.status === "unknown")  {
//            args.fbresponse.status !== "unknown"
//            console.log('redirect to FB Login.');
        
//          }
//        }



      } else {
        console.log("Handle the error. Facebook didn't logyou in ", typeof args, args.fbresponse.status);
        $rootScope.message = "Facebook Authentication Failed. Please tweet @benguthrie. He's working on it.";
        
      }
      
    }
        
    
   
  });
      
  */
  
  
  
  // TODO1 - The below should be triggered as part of the callback.
  var initCallback = function(){
    console.log('controller.js initCallback made.');
    if(!$rootScope.token || $rootScope.token === null){
      // See if it's in the local storage.
      $rootScope.message = "Looking for token in local storage.";
      // Check for Active Token on load
      if(localStorageService.get('token')){
        $rootScope.message = "Token Found";
        console.log("There was a token in the local storage.");
        console.log("BUT IS IT VALID?!?!?!? TODO1 - Only apply the token if it's a valid one.");
        // Set the token.
        $rootScope.token = localStorageService.get('token');

        // This should only happen when the app loads, and at specific times, so we'll build everything back up in dbFactory
        $rootScope.message = "use dbFactory.refreshData to check if the token is valid.";
        dbFactory.refreshData($rootScope.token);

      } else {
        console.log("No token in local storage.");
        
        // $location.path('/login');
        $rootScope.message = "There is no token in local storage. What next?";
        $rootScope.$broadcast("broadcast",
          { command: "state", path: "login" , 
           debug: "controllers.js 127. No token in local storage at the loading screen."} 
         );
      }
    }
  }
  
  // The first function of the app is initializing it the database.
  dbFactory.dbInit(initCallback);

  // Global 
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
// REMOVED Facebook from the injectors
.controller('AppCtrl', function($scope, $state, dbFactory, $rootScope, localStorageService,$ionicViewService) {
  
  

  // On load, load the correct interface, based on the token.
  
  $rootScope.debug('AppCtrl load: Token: ' + $rootScope.token );
  // Execute the check for the token in the RootScope on load.
  
  if(typeof ($rootScope.token) === 'string' && $rootScope.token ==='loading'){
    console.log('initial: loading');
    $rootScope.debug('Appctrl - 179 Rootscope is loading.');
    $state.go('loading');
  } else if (typeof ($rootScope.token) === 'string' && $rootScope.token.length > 0){
    // We will assume that the token is valid TODO1 - Test it.
    $rootScope.debug('Appctrl - 183 Loading because the token looks good.');
    // $state.go('app.home'); // TODO1 - Diego - Should this be moved? - Not working!
    $rootScope.$broadcast("broadcast",{ command: "state", path: "app.home", debug: "Valid token. Move."} ); // TODO2 -  Test this. 
    // TODO1 - Check this, or will that happen when requesting the first call?
    $ionicViewService.clearHistory();
    // $location.path('/login');
  } else {
    console.log('initial: null?');
    $rootScope.message = "Initial token is null? ";
    $rootScope.debug('Appctrl - 189 Rootscope is null?');
    // TODO1 When would this be done? $state.go("login");
  }
  
  $scope.deleteFBaccess = function() {
    console.log('deleteFBaccess in loginctrl TODO1 ');
    // TODO1 Restore this: Facebook.unsubscribe();
  };
  
  // This is for the logged in user
  $scope.showUser = function(userId, userName, dataScope, fbuid){
    console.log('controllers.js - showUser 87');
    dbFactory.showUser(userId,userName, dataScope, fbuid);
  };
  
  
  // Grab the user info here as soon as they login.
  
  $scope.login = function () {
    $rootScope.$broadcast('broadcast',{ command: "login", platform: "facebook", debug: "Controllers.js 210. OAuth.login"});
  };
  
  // Global Logout Handler
  $scope.logout = function () {
    // TODO: Make database service call.
    
    $rootScope.debug('Appctrl - TODO2: FB Logout call.');
    // $state.go('app.login',{listId: newListId});
    // TODO1 - Restore this. Facebook.logout();
    
    // Clear all the stores.
    dbFactory.dbInit();
    localStorageService.clearAll();
    // $rootScope.debug('clear rootScope. Rootscope: ' + JSON.stringify($rootScope));
    
    // Clear local storage
    
    // TODO1 - Restore this, most likely. $state.go("login");
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
      $rootScope.$broadcast("broadcast",{ command: "state", path: "app.home", debug: "Controllers.js 260. Go home."} );
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
    
    $scope.setToken = function(){
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
  

  $scope.getSome = function(typeFilter){
    $rootScope.bite = [];
    $rootScope.nav.homeView = typeFilter;
    $scope.bite = 'this was reloaded';
      // dbGetSome = function (theScope, userfilter, listfilter, sharedFilter)
      dbFactory.dbGetSome('$rootScope.bite', typeFilter, '', 'ditto');
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
  
  $scope.thisDomain = function(){
    console.log('thisDomain: ',document.URL);
    $rootScope.message = 'domain: ' + document.URL;
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



.controller('ProfileCtrl', function($scope,dbFactory,$rootScope) {
  // console.log("Profile Control",$scope);
  
  
  // Put the user info in the title bar
  $scope.profileTitle = "<img src='http://graph.facebook.com/" + $rootScope.profileData.fbuid + "/picture' class='title-image'> " + $rootScope.profileData.userName;
  
  
  $scope.showFeed = function(userId, oldestItem){
    // 
    console.log('profile show feed: ',userId, ' oldest: ',oldestItem);
    // showFeed = function(theType, userFilter, listFilter, myState, oldestKey)
    dbFactory.showFeed('profile',userId,'','','','');
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

.controller('addListCtrl', function($scope, $rootScope, $stateParams, dbFactory){
  this.newList = {title:''};
  console.log('addListCtrl called');
  
  $scope.createList = function(){
    console.log('User Clicked "Create List" with this title: ',this.newList.title);
    var success = function(listName, listId){
      console.log('success function',listName, listId);
      // navigate to that list.
      dbFactory.showAList(listName, listId, $rootScope.user.userId );
    }
    
    var failure = function(theValue){
      console.log('failure function',theValue);
    }
    
    dbFactory.newList( this.newList.title, success, failure);
  }
  
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
})
.controller('FriendsCtrl', function($scope, $rootScope) {
  // console.log("You have tried to control your friends",$rootScope.friendStore);
})

.controller('FriendCtrl', function($scope, $rootScope) {
    console.log("You clicked on a friend.");  
})

/* 10/21/2014 - Added RootScope to populate the list with? TODO1 - Build lists from $rootScope.lists */
.controller('ListsCtrl', function($scope, $rootScope, dbFactory,$state, $ionicActionSheet ) {
  // On load, load up their lists.
  dbFactory.getUserListOfLists($rootScope.user.userId,'$rootScope.lists');
  
  $scope.loadLists = function(){
   // user.userId is hard coded in lists, because it's always going to be this user's lists.
    console.log('ListsCtrl - loadLists')
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

.controller('FeedCtrl', function($scope, $stateParams, $rootScope, dbFactory) {
  // var mainFeed = function (theType, continueFrom, userFilter, listFilter, sharedFilter, scopeName, newerOrOlder){
  dbFactory.mainFeed('friends', '', '', '', '', 'feed.friends',''); // Should only evaluate when navigating to "feed"
  
  $scope.feed = function(filter, continueFrom, newerOrOlder){
    // Set the active view.
    $rootScope.nav.feedView = filter;
    
    // Tell dbFactory what to do.
    dbFactory.mainFeed(filter, continueFrom, filter, '', '','nav.feed.' + filter, newerOrOlder);
    
  };
  

  
})

.controller('ListCtrl', function($scope, $stateParams, $rootScope, dbFactory) {
  $scope.listId = $stateParams.listId;
  
  $scope.navView = 'ditto';

  $scope.view = function(theView){
    // if it's already active, then make the call.
    // console.log('pressed view. ', theView);
    
    // If it is already this view, then reload this content.
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
  
  $scope.loginOAuth = function(provider) {
    $rootScope.message = "<h3>1. loginOAuth Pressed</h3>";
    
    // TODO1 - This is the bit that handles the login.
    if(provider === 'facebook'){
      // Do that.
      
      $rootScope.message = "<h3>2. Call OAuth.login('facebook')</h3>";
      // 
      $rootScope.$broadcast('broadcast',{ command: "login", platform: "facebook", debug: "controller.js 506 login with facebook."});
      
      
      $state.go('loading');      // TODO 1 - Is this working?
      // Facebook.login();
      
      
    } else {
      $rootScope.message = "<h3>2. END - Unknown Provider</h3>";
      
    }
    // $window.location.href = '/auth/' + provider;
  };
})
