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

  /* 1/23/2015
  $scope.loadLists = function(){
    $rootScope.debug('AppCtrl You want to load lists into your profile.');
    // dbFactory.getUserListOfLists($rootScope.vars.user.userId);
    dbFactory.getUserListOfLists($rootScope.user.userId , '$rootScope.lists');
  };
   */
  
    
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
  $scope.store = {
      'friends':[{loading: true}],
      'strangers':[{loading: true}]
    };
  
  // Load up some content for both views
  if($scope.store.friends[0].loading || $scope.store.friends[0].length ===0 ){
    dbFactory.promiseGetSome('friends', '', 'ditto').then(function(d) {
      $scope.store.friends = d;
    });
  }
  if($scope.store.strangers[0].loading || $scope.store.strangers[0].length ===0 ){
    dbFactory.promiseGetSome('strangers', '', 'ditto').then(function(d) {
      $scope.store.strangers = d;
    });
  }
  
  
  
  
  $scope.view = 'friends';

  $scope.getSome = function(typeFilter){
    
    
      // dbGetSome = function (theScope, userfilter, listfilter, sharedFilter)
    if($scope.view === typeFilter ){
      dbFactory.promiseGetSome(typeFilter, '', 'ditto').then(function(d) {
        console.log('d: ',d);

        $scope.store[typeFilter] = d;

        // con
      });
    } else {
      $scope.view = typeFilter;
    }
    
    
    
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
      userId:null,
      userName: null,
      fbuid: null
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
        
        // Get user information. TODO2 
        $scope.userInfo.userId = parseInt($stateParams.userId);
        // console.log('413 ', $scope.userInfo.userId);
      } else {
        console.log('CONTROLLER.390 NO VALID USER ID');
      }
      
    } else {
      console.log('ERROR controllers.ProfileCtrl 391 - invalid userId in the URL.');
    }
  
    lsTypes = new Array('ditto','shared','feed','lists','chat');
  
    if( parseInt($rootScope.user.userId) === parseInt($scope.userInfo.userId) ){
      var lsTypes = new Array('feed','lists'); // TODO2 Put in the chat bit again. 
      $scope.view = 'feed';
      console.log('updated scope view ? ', $scope.view);
    }
  
    for (var i in lsTypes){
      console.log('each: ', lsTypes[i]);
      if(lsTypes[i] === 'shared'){
        dbFactory.promiseGetSome($scope.userInfo.userId, '', 'shared').then(function(d) {
          $scope.store.shared = d;
          // console.log('update: in promise shared: ', d);
          //console.log('sun: ', $scope.userInfo.userName.length, ' dusername: ', d[0].username);
              
          if( $scope.userInfo.userName === null && d[0].username){
            
            $scope.userInfo.userName = d[0].username;
            $scope.userInfo.fbuid = d[0].fbuid;
          }
        });
        
        
      }
      
      else if(lsTypes[i] === 'ditto' ){
        dbFactory.promiseGetSome($scope.userInfo.userId, '', 'ditto').then(function(d) {
          $scope.store.ditto = d;
          console.log('update: in promise  ditto: ', d);
        });
        
      } else if(lsTypes[i] === 'feed' ) {
         console.log('show the feed');
        // Load from local storage first.
        if( localStorageService.get('user' + $scope.userInfo.userId + 'feed') ) {
          // We know it's a user, so let's set local storage.
          $scope.store.feed = localStorageService.get('user' + $scope.userInfo.userId + 'feed');
          
          // Pull the name from local storage, if we have it.
          if( !$scope.userInfo.userName ){
            console.log( 'feed0: ', $scope.store.feed[0] );  ;
            // console.log( typeof($scope.feed[0].username ) ) ;
            $scope.userInfo.userName = $scope.store.feed[0].username;
            $scope.userInfo.fbuid = $scope.store.feed[0].fbuid;
            console.log('load feed: ', $scope.store.feed);
          }
        }
        
        dbFactory.promiseFeed( 'profile', $scope.userInfo.userId, '', '', '', '').then(function(d) {
          $scope.store.feed = d;
        });
        
          
      } else if(lsTypes[i] === 'lists' ) {
        // Load from local storage first.
        if( localStorageService.get('user' + $scope.userInfo.userId + 'lists') ) {
          // We know it's a user, so let's set local storage.
          $scope.store.lists = localStorageService.get('user' + $scope.userInfo.userId + 'lists');
        }
        
        dbFactory.promiseListOfLists( $scope.userInfo.userId ).then(function(d) {
          $scope.store.lists = d;
          
        });
          
      }
      else {
        console.log('TODO1 - Auto load this');
      }
      
    }
  

  
    // Put the user info in the title bar
    $scope.profileTitle = '<img src="http://graph.facebook.com/' + $scope.fbuid + '/picture" class="title-image"> ' + $scope.userName;


    $scope.showFeed = function(userId){
      // 
      
      $scope.view = 'feed'; 
      console.log('profile show feed: ',userId, ' oldest: ');
      // showFeed = function(theType, userFilter, listFilter, myState, oldestKey)
      // $scope.store.feed = dbFactory.showFeed('profile',userId,'','','','');
      
       
      // Then Update
      dbFactory.promiseFeed ('profile', $scope.userInfo.userId, '', '', '', '') .then (function(d){
        $scope.store.feed = d;
        if( $scope.userInfo.userName === null && d[0].username){

          $scope.userInfo.userName = d[0].username;
          $scope.userInfo.fbuid = d[0].fbuid;
        }
      });

    };
  
  $scope.userChat = function(){
    $scope.view = 'chat';
  };

    $scope.getSome = function(filter){
      /* Reload only if it's the second press of the button */
      if($scope.view === filter){
        $scope.store[filter] = [{'loading': true}];
        dbFactory.promiseGetSome($scope.userInfo.userId, '', filter).then(function(d) {
          $scope.store[filter] = d;
          console.log('update: in promise '+ filter +' : ', d);
          if( $scope.userInfo.userName === null && d[0].username){
            
            $scope.userInfo.userName = d[0].username;
            $scope.userInfo.fbuid = d[0].fbuid;
          }
        });  
      }
      $scope.view = filter;
      
      console.log('profileScope view after getSome: ', $scope.view);
      
      console.log("Get Some for userid: ", $scope.userInfo.userId, filter, 'end');
      // $scope.store[ filter ] = dbFactory.showFeed('profile', $scope.userId, filter , '', '', '');
      // 
      // dbGetSome = function (theScope, userfilter, listfilter, sharedFilter)
      // dbFactory.dbGetSome('$rootScope.profileData.'+filter, userId, '', filter);
    };

    $scope.showLists = function(userId){
      // Only reload if it's already lists.
      if($scope.view === 'lists' || $scope.store.lists[0].loading){
        console.log('reload lists for this user in their profile..');
        // dbFactory.getUserListOfLists(userId, '$rootScope.profileData.lists');
        $scope.store.lists = [{loading: true}];
        dbFactory.promiseListOfLists( userId ).then(function(d) {
          $scope.store.lists = d;

        });
      
      };
      $scope.view = 'lists'; 

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
    // console.log('search watch found', $scope.search.term );
    return $scope.search.term;
  }, function(newValue, oldValue){
    // console.log('TODO2 - This is where oldValue is used: ' + oldValue + ' to ' + newValue);
    if(typeof newValue !== 'undefined' && newValue.length > 0){
      
      dbFactory.promiseSearch( newValue, 'general').then(function(d){  
        $scope.search.results = d.results;
      });
      
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

  console.log('listsCtrl');
  // On Load; Update with new data
  
  dbFactory.promiseListOfLists( $rootScope.user.userId ).then(function(d) {
    $scope.listsData = d;

  });
  
  $scope.loadLists = function(){
   // user.userId is hard coded in lists, because it's always going to be this user's lists.
    console.log('ListsCtrl - loadLists');
    
    dbFactory.promiseListOfLists( $rootScope.user.userId ).then(function(d) {
      $scope.listsData = d;
    });
  };

  // TODO3 Delete a list
})


.controller('DocsCtrl', function() {
 
  
})

.controller('FeedCtrl', function($scope, $stateParams, $rootScope, dbFactory) {
  // On load, open friends.
  $scope.view = 'friends';
  $scope.store = {
    friends: [{loading: true}],
    strangers: [{loading: true}]
  };
  
  
  
  // Populate the feeds on load
  if($scope.store.friends.length ===0 || $scope.store.friends[0].loading === true){
    if(localStorageService.get('feedFriends')){
      $scope.store.friends = localStorageService.get('feedFriends');
    };
      
    $scope.store.friends[0] = {loading: true};
    dbFactory.promiseFeed( 'friends', '', '', '', '', '').then(function(d) {
      $scope.store.friends = d;
      localStorageService.set('feedFriends',d);
    });
  }
  
  // Populate the feeds on load
  if($scope.store.strangers.length ===0 || $scope.store.strangers[0].loading === true){
    
    if(localStorageService.get('feedStrangers')){
      $scope.store.strangers = localStorageService.get('feedStrangers');
    };
    
    $scope.store.strangers[0] = {loading: true};
    dbFactory.promiseFeed( 'strangers', '', '', '', '', '').then(function(d) {
      $scope.store.strangers = d;
      localStorageService.set('feedStrangers',d);
    });
  }
  
  // var mainFeed = function (theType, continueFrom, userFilter, listFilter, sharedFilter, scopeName, newerOrOlder){
  // dbFactory.mainFeed('friends', '', '', '', '', 'feed.friends',''); // Should only evaluate when navigating to "feed"
   
  $scope.feed = function(filter, continueFrom, newerOrOlder){
    if(filter === $scope.view){
      /* Refresh */
      $scope.store[filter] = [{loading: true}];
      dbFactory.promiseFeed( filter, '', '', '', '', '').then(function(d) {
        $scope.store[filter] = d;
      });
    }
    // Set the active view.
    $scope.view = filter;
    
  };
  

  
})

.controller('ListCtrl', function($scope, $stateParams, $rootScope, dbFactory, localStorageService) {
  
  console.log('listId: ', $stateParams.listId, $stateParams);
  
  $scope.view = 'ditto';

  $scope.store = {
      'ditto':[],
      'shared':[],
      'feed':[],
      'mine':[],
      'strangers':[]
    };
  
  $scope.listInfo = {
    listId:$stateParams.listId,
    listName: null
  };
  
  /* Clear any previously entered text in the 'add to list' section */
  $scope.newItem = {theValue: null};
  
  
  // Populate the list on load.
  var listViews = Array('ditto', 'shared', 'feed', 'mine', 'strangers');
  
  // TODO2 - userIdFilter is ignored. It should allow for a specific user to be viewed. 
  var userIdFilter = 0; // TODO2 - Allow this to be set.
  var sharedFilter = 0; // TODO2 - Allow this to be set.
  var oldestKey = 0; // TODO2 - Allow this to be set.
  
  /* Load all the list view types */
  var i = 0;
  for (i in listViews) {
    if(!$scope.store[listViews[i]].length){
      $scope.store[listViews[i]][0] = {loading: true};
    }
    
    /* Apply local storage if it's present */
    if(localStorageService.get('listId' + $stateParams.listId + listViews[i])){
      $scope.store[listViews[i]] = localStorageService.get('listId' + $stateParams.listId + listViews[i]);
    }
    
    /* Load each of the views from the API */
    dbFactory.promiseList($scope.listInfo.listId, userIdFilter, listViews[i], sharedFilter, oldestKey).then(function(d) {

      /*  
        Only apply valid responses to the scope. Types could be null. 
         use d.type because of async responses require the data to define itself. 
      */
      if ( typeof(d.type) !== 'undefined') {
        $scope.store[d.type] = d.results[d.type];
      } else {
        /* if no response, clear the results */
        $scope.store[d.type] = [];
      }
      
      /* If there are results, and we need a list name, then apply the list name from the data */
      console.log('d.results', d.results);
      if( $scope.listInfo.listName === null 
         && typeof(d.results) !== 'undefined'
         && typeof(d.results[d.type][0].lists[0].listname)!=='undefined')
      {
        $scope.listInfo.listName = d.results[d.type][0].lists[0].listname;
      }

    });
  }
  
  /* If we don't have a list name at this point, it must be a new list. Force Load it. */
  if($scope.listInfo.listName === null || $scope.listInfo.listName.length ===0){
    console.log('force load the list info, and assume this user created the list');
    dbFactory.promiseThingName($scope.listInfo.listId).then(function(d){
      console.log('d.results: ', d.results, d.results.length);
      if(d.results){
        console.log('valid results from d.results', d.results[0].thingName);
        $scope.listInfo.listName = d.results[0].thingName;
        // Set the view to theirs, so they can add an item.
        $scope.view ='mine';
        
      }
      
    });
  }
  
  /* End the scope loading. */
  
  // TODO3 - Link directly to parts of this view. i.e. lists/400/view/shared

  /* This is the function used when changing views */
  $scope.setView = function(theView){
    
    /* If it is already this view, or loading, then reload this content. */ 
    if(theView === $scope.view || $scope.store[theView].length === 0 || $scope.store[theView][0].loading === true){
      /* The the view is passed as part of the database call */
      dbFactory.promiseList($scope.listInfo.listId, userIdFilter, theView, sharedFilter, oldestKey).then(function(d) {
      
        // only add it to the scope if it's a valid response.
        if ( typeof(d.type) !== 'undefined') {
          $scope.store[d.type] = d.results[d.type];
        } else {
          /* set to no records if we got it. A message keys off of 0 records */
          $scope.store[theView] = [];
        }
      });
    }
    /* Update the view after the check. This means that data isn't reloaded unless it's the same view */
    $scope.view = theView;
    
  };
  
  
  
  
  $scope.addToList = function(newItem){
    /* Focus on my list */
    $scope.view = 'mine';
    
    /* Create a placeholder for while the API responds */
      var tempNum = randNum(10000);
      var tempItem = {
        added: Date.now(),
        commentActive: null,
        commentRead: null,
        commentText: null,
        dittofbuid: null,
        dittokey: null,
        dittouser: null,
        dittousername: null,
        friendsWith: '',
        id: tempNum,
        ik: null,
        mykey: 1,
        thingname: '...' + newItem,
        tid: null
      };
    
    console.log('me? ', $rootScope.user);
    
    /* Check to make sure that my list is there, and create it */
      console.log('my scope', $scope.store.mine );
      if($scope.store.mine.length === 0){
        console.log('create my list',$scope.store.mine.length);
        var myList = {
          fbuid: $rootScope.user.fbuid,
          uid: $rootScope.user.userId,
          username: $rootScope.user.userName,
          lists: [
            {
              lid: $scope.listInfo.lid,
              listname: $scope.listInfo.listName,
              items: []
            }
          ]
        };
        $scope.store.mine.unshift(myList);
      } 
    
    /* remove the existing item from my list. */
      var i = 0;
    for(i in $scope.store.mine[0].lists[0].items){
      if($scope.store.mine[0].lists[0].items[i].thingname.toUpperCase() === newItem.toUpperCase()){
        $scope.store.mine[0].lists[0].items.splice(i,1);
        break;
      }
    }
    
    /* Add the new item to the top of this list Temporarily */
     $scope.store.mine[0].lists[0].items.unshift(tempItem);
    
    
    
    var itemObj = { lid: $scope.listInfo.listId, thingName: newItem};
    var newItemPos = null;
    /* Reset the item */
    $scope.newItem = {theValue: null};
    // TODO1 - Move this to a promise. 
    dbFactory.promiseAddToList(itemObj).then(function(d){
      console.log('new item: ', newItem, d);
      /* Check to see if the item has a valid key */
      if(typeof(d.mykey) !== 'undefined'){
        
        /* Valid results from the API. Begin processing adding this item */
          /* Overwrite the temp value. We know that it will only have one entry. */
          var i = 0, j=0;
          for(i in $scope.store.mine[0].lists[0].items){
            if($scope.store.mine[0].lists[0].items[i].id === tempNum){
              newItemPos = i;
              break;
            }
          }
        
      } else {
        console.log('error. TODO2 - Handle this? ');
      }
      
      /* Overwrite the temp item with the new item */
      $scope.store.mine[0].lists[0].items[i] = d;
      
      
      
    });
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