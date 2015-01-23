'use strict';
angular.module('Plitto.controllers', [])

.run(function($rootScope, dbFactory, $state, $ionicModal, $location , OAuth, pFb , localStorageService){

  /* disabled 1/19/2015
  var headerTitle = function() {
    //console.log('HeaderTitle');
    return 'Title from Function';
  };
  */

  
  /* Control all the login and redirect functions */
  $rootScope.$on('broadcast', function (event, args){
    // console.log('heard command');
    
    if( typeof args.debug === 'string'){
      // console.log('args.debug: '"', args.debug);
    }
    
    console.log('command event: ', event, 'args: ', args, args.debug );
    
    // console.log("Debug message: ", args.debug);
    
    if(args.command === 'login'){
      if(args.platform === 'facebook')
      {
        // console.log('login with facebook');
        // 
        OAuth.login('facebook');
        // pFb.login();
      }
      else if (args.platform === 'facebookFinishLogin') {
        console.log('finsh fb login', event, args, 'tokenhash?', args.tokenHash );
        // Process the token hash. 
        var theToken = args.tokenHash.replace('#/access_token=', ''); // First character should be the beginning of the token.
        theToken = theToken.substring(0, theToken.indexOf('expires_in') - 1 );
        
        // console.log("TOKEN TO PROCESS: ", theToken);
        $rootScope.loginMessage = 'Facebook Token received. Generating Plitto Login';
        dbFactory.fbTokenLogin(theToken);
      }
    }
    else if (args.command === 'redirect' )
    {
      // 
      console.log('args.redirect, REDIRECT controllers.47 args.path:  ', args.path );
      plainJsRedirect(args.path); /* Global function in functions.js */
      
    }
    
    /* This is used to navigate around the app */
    else if (args.command === 'state' ){
      console.log( 'controllers.js 31 $state.go, args.path: ', args.path );
      // TODO1 - This is not working for the loading page.
      // TODO1 - Restore this . 
      console.log('controller.js58 state.go: ', args.path);
      $state.go(args.path);
      
      if(args.path === 'search'){
        /* Focus on the search */
         // TODO2 - Do something with this? 
        console.log('todo2 search broadcast request');
      } 
      
      // $state.go("app.home");
      // $state.go("app.debug");
    }
    else if (args.command === 'deleteFBaccess'){
      console.log('Delete from FB');
      pFb.deleteFBaccess();
    }
  });
  
  // TODO1 - The below should be triggered as part of the callback.
  var initCallback = function(){
    console.log('controller.js initCallback made.');
    if(!$rootScope.token || $rootScope.token === null){
      // See if it's in the local storage.
      $rootScope.loginMessage = 'Looking for token in local storage.';
      // Check for Active Token on load
      if(localStorageService.get('token')){
        $rootScope.loginMessage = 'Token Found';
        console.log('There was a token in the local storage.');
        console.log('BUT IS IT VALID?!?!?!? TODO1 - Only apply the token if it\'s a valid one.');
        // Set the token.
        $rootScope.token = localStorageService.get('token');

        // This should only happen when the app loads, and at specific times, so we'll build everything back up in dbFactory
        $rootScope.loginMessage = 'use dbFactory.refreshData to check if the token is valid.';
        dbFactory.refreshData($rootScope.token);

      } else if (
        window.location.hash.indexOf('access_token') !== 'undefined' &&
        window.location.hash.indexOf('access_token') !== -1
      ){
        console.log('Access Token: Querystring? ' +
          window.location.hash.indexOf('access_token'),
          ',  QueryString.access_token '
        );
      }
      else {

        console.log('No token in local storage.');
        
        // $location.path('/login');
        $rootScope.loginMessage = 'There is no token in local storage. Redirect to login page.';
        $location.path('/login');
        
        // Only do this if there isn't an auth_token in the URL.
        $rootScope.$broadcast('broadcast',
          {
            command: 'state',
            path: 'login',
            debug: 'controllers.js 127. No token in local storage at the loading screen.'
          }
        );
      }
    }
  };
  
  // The first function of the app is initializing it the database.
  dbFactory.dbInit(initCallback);

  // Global 
  $rootScope.debug = function(message) {

    if(typeof($rootScope.loginMessage) === 'string' && $rootScope.loginMessage.length > 255){
      $rootScope.loginMessage = 'Login cleared';
    }

    if($rootScope.debugOn === true){
      if(typeof (message) ==='string'){
        console.log(message);
        $rootScope.loginMessage = $rootScope.loginMessage + ' | ' + message;
      } else {
        console.log('message is not a string', message);
      }
    }
  };
  
})


// REMOVED Facebook from the injectors // 13 - ionicNavBarDelegate - 14 - $ionicHistory
.controller(
  'AppCtrl',
  function(
    $scope,
    $state,
    dbFactory,
    $rootScope,
    localStorageService
//     $ionicHistory 
    ) {
  
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
    
    if(typeof $rootScope.token === 'string' && $rootScope.token !== 'loading'){
      // Only when it's loading or home.
      if($state.current.name === 'login' || $state.current.name === 'loading' ){
        $rootScope.$broadcast('broadcast',{ command: 'state', path: 'app.home', debug: 'Valid token. Move.'} ); 
      }
      // TODO2 -  Test this. 
    }
    dbFactory.updateCounts();
    // TODO1 - Check this, or will that happen when requesting the first call?
//     $ionicHistory.clearHistory();
    // $location.path('/login');
  } else {
    console.log('initial: null?');
    $rootScope.loginMessage = 'Checking for null token.';
    $rootScope.debug('Appctrl - 189 Rootscope is null?');
    // TODO1 When would this be done? $state.go("login");
  }
  
  $scope.deleteFBaccess = function() {
    console.log('deleteFBaccess in loginctrl TODO1 ');
    $rootScope.$broadcast('broadcast', { command: 'deleteFBaccess', debug: 'Delete from FB' });
    // TODO1 Restore this: Facebook.unsubscribe();
  };
  
  // This is for the logged in user
  $scope.showUser = function(userId, userName, dataScope, fbuid){
    
    console.log('controllers.js - showUser 87');
    dbFactory.showUser(userId,userName, dataScope, fbuid);

  };
    
  // Grab the user info here as soon as they login.
  
  $scope.login = function () {
    $rootScope.$broadcast('broadcast',
      {
        command: 'login',
        platform: 'facebook',
        debug: 'Controllers.js 210. OAuth.login'
      }
    );
  };
  
  // Global Logout Handler - TODO2 - This was added to functions.js and should be removed from here.
  $scope.logout = function () {
    // TODO: Make database service call.
    console.log('logout');
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
    $rootScope.debug('AppCtrl You want to load lists into your profile.');
    // dbFactory.getUserListOfLists($rootScope.vars.user.userId);
    dbFactory.getUserListOfLists($rootScope.user.userId , '$rootScope.lists');
  };
  
    
})

  .controller('ThingCtrl',
    function($scope, $rootScope,dbFactory) {
      // Control for thing goes here.
      console.log('controllers.js.thingCtrl use scope, rootscope, dbFactory', $scope, $rootScope, dbFactory);
    }
  )

  .controller('LoadingCtrl',function( $scope, $rootScope ) {
    // Control for thing goes here.
    $scope.thetoken = $rootScope.token;
    $rootScope.debug('loadingctrl loaded');
  
    /* When this screen loads, if there is a token, go home. */
    if(typeof $rootScope.token === 'string' && $rootScope.token !== 'loading'){
      console.log('Controllers 259 Done loading. Go home.');
      $rootScope.$broadcast('broadcast', { command: 'state', path: 'app.home', debug: 'Controllers.js 260. Go home.' } );
    }
     
    $scope.showToken = function(){
      $rootScope.debug('LoadingCtrl showToken');
      
      $scope.thetoken = $rootScope.token;
    };
    
    $scope.clearToken = function(){
      $rootScope.debug('LoadingCtrl clearToken');
      $rootScope.token = '';

      $scope.thetoken = 'cleared!';
    };
    
    $scope.setToken = function(){
      $rootScope.debug('LoadingCtrl setToken to 35358a19f081483800da33f59635e86f');
      $rootScope.token = '35358a19f081483800da33f59635e86f';
      $scope.thetoken = '35358a19f081483800da33f59635e86f';
    };
  })

.controller('HomeCtrl',function ( $scope, $rootScope, dbFactory ) {
  

  $scope.getSome = function(typeFilter){
    // console.log("Get SSSOMe");
    $rootScope.bite = [];
    $rootScope.nav.homeView = typeFilter;
    $scope.bite = 'this was reloaded';
      // dbGetSome = function (theScope, userfilter, listfilter, sharedFilter)
    dbFactory.dbGetSome('$rootScope.bite', typeFilter, '', 'ditto');
  };

})


.controller('DebugCtrl', function($scope,dbFactory, $rootScope, localStorageService, $state) {
  $scope.localStorage = function(type){
    if(type === 'get'){
      localStorageService.get('debugNote'); 
    } else if (type === 'set'){
      localStorageService.set('debugNote', 'The Current Unix Time is: ' + Date.now());
    }
    console.log('test debug local Storage');
  };
  
  $scope.funny = function(type, $rootScope){
    if(type ==='rootScope'){
      // $scope.funnyText = $rootScope.length;
      $scope.funnyText =  50;
    }
    else if(type === 'stateName'){
      $scope.funnyText = 
        {
          'currentTime': Date.now(),
          'state.current.name': $state.current.name
        } 
    } else if (type === 'clearRootscope'){
      $rootScope = '';
    } else {
      $scope.funnyText = 'note ready ' + Date.now();
    }
  };
  
  
  $scope.loadList = function(type){
    $rootScope.debug('DebugCtrl DEBUG loadList TYPE: ' +type);
    
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
    $rootScope.loginMessage = 'domain: ' + document.URL;
  };
  
  $scope.debugCtrl = function(state){
    $rootScope.debugOn = state;
    $rootScope.debug('Debug now: ' +state);
  };
  
  $scope.debugLog = [{startItem: 'this is the start item'}];
  
  $scope.testString = function(){
    $scope.debugLog = 'string';
  };
  
  $scope.testObj = function(){
    $scope.debugLog = JSON.stringify([{item: 'this is a test item'}]);
  };
  
  $scope.rootScopePart = function(part){
    $scope.debugLog = JSON.stringify(eval('$rootScope.' + part));
  };
  
})


/* Controller for user profile 
  1/22/2015 - Request when reasonable. 
*/
.controller('ProfileCtrl',
  function($scope, dbFactory, $rootScope, $stateParams, localStorageService ) {
    // Prepare Scope Variables
   
    $scope.view = 'ditto';
    $scope.store = {
      'ditto':[{loading: true}],
      'shared':[{loading: true}],
      'feed':[{loading: true}],
      'lists':[{loading: true}],
      'chat':[{loading: true}]
    };
    $scope.userInfo = {
      'userId':null,
      'userName': null,
      'fbuid': null
    };

  
    /* TODO2 - Diret link to a part of a user's profile through the routing 
      
    */
  
    if($stateParams.view){
      $scope.view = $stateParams.view;
    }
  
    // load profile data if this was direct linked to.
    if(!$scope.userInfo.userId) {
      console.log('no userid set in profiledata. Set with one of these. ', $stateParams.userId, typeof($stateParams.userId));

      // Get it from the url then.
      // Get a valid user id, and pull content for it.
      if( parseInt ( $stateParams.userId) > 0){
        // console.log('CONTROLLER.387 GOOD VALID USER ID');
        // 
         //console.log('profileCtrl 399', $scope.userInfo.userId);
        
        // Get user information. TODO2 
        $scope.userInfo.userId = parseInt($stateParams.userId);
        
        // console.log( 'db.userInfo from database: ', dbFactory.userInfo( 2 ) );
        // dbFactory.userInfo( $scope.userInfo.userId );
        // $scope.userInfo = dbFactory.userInfo( $scope.userInfo.userId ) ;
        
        // console.log('413 ', $scope.userInfo.userId);
        
        
      } else {
        console.log('CONTROLLER.390 NO VALID USER ID');
      }
      
    } else {
      console.log('ERROR controllers.ProfileCtrl 391 - invalid userId in the URL.');
    }
  
    lsTypes = new Array('ditto','shared','feed','lists','chat');
  
    if($rootScope.user.userId === $scope.userInfo.userId){
      var lsTypes = new Array('feed','lists');
    }
  
    for (var i in lsTypes){
      console.log('each: ', lsTypes[i]);
      if(lsTypes[i] === 'shared'){
        dbFactory.promiseGetSome($scope.userInfo.userId, '', 'shared').then(function(d) {
          $scope.store.shared = d;
          console.log('update: in promise shared: ', d);
        });
      }
      
      else if(lsTypes[i] === 'ditto' ){
        dbFactory.promiseGetSome($scope.userInfo.userId, '', 'ditto').then(function(d) {
          $scope.store.ditto = d;
          console.log('update: in promise  ditto: ', d);
        });
      } else if(lsTypes[i] === 'feed' ) {
        // Load from local storage first.
        if( localStorageService.get('user' + $scope.userInfo.userId + 'feed') ) {
          // We know it's a user, so let's set local storage.
          localStorageService.get('user' + $scope.userInfo.userId + 'feed');
        }
       
          
      }
      else {
        console.log('TODO1 - Auto load this');
      }
      
      
    }
  

  
    // Put the user info in the title bar
    $scope.profileTitle = '<img src="http://graph.facebook.com/' + $scope.fbuid + '/picture" class="title-image"> ' + $scope.userName;


    $scope.showFeed = function(userId){
      // 
      console.log('profile show feed: ',userId, ' oldest: ');
      // showFeed = function(theType, userFilter, listFilter, myState, oldestKey)
      // $scope.feed = dbFactory.showFeed('profile',userId,'','','','');
      
       
      // Then Update
      dbFactory.promiseFeed ('profile', $scope.userInfo.userId, '', '', '', '') .then (function(d){
        $scope.store.feed = d;
        console.log('update: in promise feed: ', d);
      });

    };

    $scope.getSome = function(filter){
      /* Reload only if it's the second press of the button */
      if($scope.view === filter){
        $scope.store[filter] = [{'loading': true}];
        dbFactory.promiseGetSome($scope.userInfo.userId, '', filter).then(function(d) {
          $scope.store[filter] = d;
          console.log('update: in promise '+ filter +' : ', d);
        });    
      }
      $scope.view = filter;
      
      console.log("Get Some for userid: ", $scope.userInfo.userId, filter, 'end');
      // $scope.store[ filter ] = dbFactory.showFeed('profile', $scope.userId, filter , '', '', '');
      // 
      // dbGetSome = function (theScope, userfilter, listfilter, sharedFilter)
      // dbFactory.dbGetSome('$rootScope.profileData.'+filter, userId, '', filter);
    };

    $scope.showLists = function(userId){
      console.log('reload lists for this user in their profile..');
      // dbFactory.getUserListOfLists(userId, '$rootScope.profileData.lists');
    };

    $scope.makeActive = function(){
      console.log('make active');
    };
  }
)

.controller('addListCtrl', function($scope, $rootScope, $stateParams, dbFactory){
  $scope.newList = {title:''};
  console.log('addListCtrl called');
  
  // Initialize a new search.
  $scope.$watch(function(){
    return $scope.newList.title;
  }, function(newValue, oldValue){
    console.log('Changed from unused oldvalue (TODO2) ' + oldValue + ' to ' + newValue);
    if(typeof newValue !== 'undefined' && newValue.length > 0){
    //   
      dbFactory.search(newValue, 'list');
    }
  });
  
  
  /* List */
  $scope.showList = function(listId, listName, userFilter, focusTarget){
    console.log('showList controllers.js 361');
    dbFactory.showAList(listId, listName, userFilter, focusTarget);
  };
  
  
  
  $scope.createList = function(){
    console.log('User Clicked "Create List" with this title: ',this.newList.title);
    var success = function(listName, listId){
      console.log('success function',listName, listId);
      // navigate to that list.
      dbFactory.showAList(listName, listId, $rootScope.user.userId );
    };
    
    var failure = function(theValue){
      console.log('failure function',theValue);
    };
    
    dbFactory.newList( this.newList.title, success, failure);
  };
  
})

.controller('SearchCtrl', function($scope, $rootScope, $stateParams, dbFactory) {
  console.log('You have entered Search');

  /* Clear out the last search */
  $scope.search = {term: $stateParams.term, results: []};
  
  // focus('input#searchField');
  
  /* On Load, make the focus the input field */
  
  // $('input#searchField').focus();
  
  /* Debug */
  // $('input#searchField').css('border','3px solid red');
  
  /* Clear the Search */
  $scope.clearSearch = function(){
    console.log('clear Search');
    $scope.search = { term: null, results: []};
  };
  

  /* List */
  $scope.showList = function(listId, listName, userFilter, focusTarget){
    console.log('showList controllers.js 383');
    dbFactory.showAList(listId, listName, userFilter);
  };
  
  /* Thing */
  $scope.showThing = function(thingId, thingName, userFilter){
    dbFactory.showThing( thingId, thingName, userFilter );
  };
  
  // Initialize a new search.
  $scope.$watch(function(){
    console.log('search watch found', $scope.search.term );
    return $scope.search.term;
  }, function(newValue, oldValue){
    // 
    console.log('TODO2 - This is where oldValue is used: ' + oldValue + ' to ' + newValue);
    if(typeof newValue !== 'undefined' && newValue.length > 0){
      console.log('search called: ', newValue);
      dbFactory.search( newValue, 'general');
    }
  });
})


/* Controller in the Chat */
.controller('chatCtrl', function($scope, $rootScope, dbFactory) {
  // console.log("You have tried to control your friends",$rootScope.friendStore);
  // console.log("CHAT CONTROL INITIALIZED.");
  // console.log("rsnf", $rootScope.stats.feed );
  $rootScope.stats.feed = dbFactory.userChat();
  console.log('rsnf', $rootScope.stats.feed );
  
  /* TODO1 - Update the notification count ? */
  
  
})

.controller('FriendsCtrl', function(  dbFactory, $scope, localStorageService ) {
  /* First - Load from Local Storage */
  $scope.friendStore = localStorageService.get('friendStore');
  
  /* Second - Load from the database */
  
  $scope.reloadFriends = function (){
    $scope.friendStore = dbFactory.friendsList();
  };
  
  console.log('You have tried to control your friends ', $scope.friendStore, 'TODO2 - Is this used / needed? ');
  // See if we need to load our friends.
  console.log('friendStore length: ' + $scope.friendStore.length);
})

.controller('FriendCtrl',
  function($scope, $rootScope) {
    console.log('You clicked on a friend. TODO1 - Do you need scope rootScope? ', $scope, $rootScope );
  }
)

/* 10/21/2014 - Added RootScope to populate the list with? TODO1 - Build lists from $rootScope.lists */
.controller('ListsCtrl', function($scope, dbFactory,$state, $ionicActionSheet, localStorageService, $rootScope ) {
  // On load, load up their lists.
  $scope.listsData = localStorageService.get('user' + $rootScope.user.userId + 'lists');
  
  // Update with new data
  $scope.listsData = dbFactory.getUserListOfLists($rootScope.user.userId,'$rootScope.lists');
  
  $scope.loadLists = function(){
   // user.userId is hard coded in lists, because it's always going to be this user's lists.
    console.log('ListsCtrl - loadLists');
    $scope.listsData = dbFactory.getUserListOfLists($rootScope.user.userId,'$rootScope.lists');
  };
  
  // TODO3 Delete a list
})


.controller('DocsCtrl', function() {
 
  
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
  };
  
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

.controller('LoginCtrl', function($scope, $window, $rootScope, $state) {
  $scope.loginOAuth = function(provider) {
    $rootScope.loginMessage = '1. loginOAuth Pressed';
    
    // TODO1 - This is the bit that handles the login.
    if(provider === 'facebook'){
      
      // Do that.
      
      
      /* RETURN 1/19/2015 */
      $rootScope.loginMessage = '1. Facebook loginOAuth Initiated';
      // Go to controllers.26
      $rootScope.$broadcast('broadcast',
        {
          command: 'login',
          platform: 'facebook',
          debug: 'controller.js 506 login with facebook.'
        }
      );

      $state.go('loading');      // TODO 1 - Is this working?
      // Facebook.login();
      
    } else {
      $rootScope.loginMessage = '2. END - Unknown OAuth Provider';
      
    }
    // $window.location.href = '/auth/' + provider;
  };
});