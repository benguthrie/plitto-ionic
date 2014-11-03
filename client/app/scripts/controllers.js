'use strict';
angular.module('Plitto.controllers', [])

.run(function($rootScope, dbFactory, $state, localStorageService, $ionicModal ){
  
   console.log('line 6');
  
  // Start by seeing if a user is logged in. TODO1 - This should be done on 10/23.
  if(!$rootScope.token){
    // See if it's in the local storage.
    if(localStorageService.get('token')){
      console.log("There was a token in the local storage.");
      console.log("BUT IS IT VALID?!?!?!? TODO1 - Only apply the token if it's a valid one.");
      // Set the token.
      $rootScope.token = localStorageService.get('token');
      // TODO1 - Test the token.
      
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
  
 
  $rootScope.showList = function(listId, listName, userFilter){
    console.log('global show a list');
    // $scope.showAList = function(listId, listName, userFilter){
    // 10/22/2014 -- Build the entries in the rootScope for the list.
    dbFactory.showAList(listId, listName, userFilter);
    
    $rootScope.nav.listView = 'ditto';
    
    
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
    // Manage debug globally.
    $rootScope.debugOn = false;

	/* End if life in the future. It leads to scope bloat */
	$rootScope.vars = { };
	$rootScope.vars.user = { userId: 0};
	$rootScope.vars.message = '';
    
    $rootScope.token = null;
    
	$rootScope.vars.temp = {};
	$rootScope.listStore = [];
	$rootScope.friendStore = [];
    $rootScope.message = 'rs message';

	// 8/26/2014 New Navigation Vars
	$rootScope.nav = {
		listView: 'ditto'
	};
    
    $rootScope.list = {
      listId: null,
      listName: null,
      ditto:[],
      shared: [],
      mine: [],
      feed: []
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
      ditto: [],
      shared: []
    };
      
  };
  
  $rootScope.showUser = function(userId, userName, dataScope){
    // console.log('global: show a user.', $rootScope.vars.user, 'uid: ',userId,' username: ',userName);
    $rootScope.profileData = {
      userName: userName,
      userId: userId,
      lists: [],
      ditto: [],
      feed: [],
      shared: []
    };
    
    $rootScope.nav.view = "user.ditto";
    
    // dbFactory.showUser(userId);
    //dbGetSome = function (theScope, userfilter, listfilter, sharedFilter)
    dbFactory.dbGetSome('$rootScope.profileData.ditto', userId, '', 'ditto');
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
  
  // Grab the user info here as soon as they login.
  
  $scope.login = function () {
    $rootScope.debug('Appctrl - controllers AppCtrl.login() pressed.');
    Facebook.login();
  };
  
  // Global Logout Handler
  $scope.logout = function () {
    // TODO: Make database service call.
    
    $rootScope.debug('Appctrl - TODO2: FB Logout call.');
    // $state.go('app.login',{listId: newListId});
    Facebook.logout();
    
    // Clear all the stores.
    $rootScope.init();
    localStorageService.clearAll();
    $rootScope.debug('clear rootScope. Rootscope: ' + JSON.stringify($rootScope));
    
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
    dbFactory.getUserListOfLists($rootScope.vars.user.userId , '$rootScope.lists');
  };
  
    
})

  .controller('ThingCtrl',function($scope, $rootScope,dbFactory) {
    // Control for thing goes here.
     

  })
  .controller('LoadingCtrl',function($scope, $rootScope,dbFactory) {
    // Control for thing goes here.
    $scope.thetoken = $rootScope.token;
    $rootScope.debug("loadingctrl loaded");
     
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
    
    $scope.test = { whatever: 'that'};
  
    $scope.userListThing = [{"uid":"69","username":"Desiree Lieber","fbuid":"1247873543","lists":[{"lid":"1795","listname":"Cities I have visited on personal travels","items":[{"added":"2008-11-22 22:54:15","tid":"3451","dittokey":"0","mykey":null,"dittouser":null,"dittofbuid":null,"dittousername":null,"thingname":"Cherry Hill, NJ"},{"added":"2008-11-22 22:54:15","tid":"3453","dittokey":"0","mykey":null,"dittouser":null,"dittofbuid":null,"dittousername":null,"thingname":"San Marcos, TX"},{"added":"2008-11-22 22:54:15","tid":"3447","dittokey":"0","mykey":null,"dittouser":null,"dittofbuid":null,"dittousername":null,"thingname":"Rome, Italy"},{"added":"2008-11-22 22:54:15","tid":"3454","dittokey":"0","mykey":null,"dittouser":null,"dittofbuid":null,"dittousername":null,"thingname":"Buda, TX"},{"added":"2008-11-22 22:54:15","tid":"3450","dittokey":"0","mykey":null,"dittouser":null,"dittofbuid":null,"dittousername":null,"thingname":"Philadelphia, PA"},{"added":"2008-11-22 22:54:15","tid":"3457","dittokey":"0","mykey":null,"dittouser":null,"dittofbuid":null,"dittousername":null,"thingname":"Wauconda, IL"},{"added":"2008-11-22 22:54:15","tid":"3104","dittokey":"0","mykey":null,"dittouser":null,"dittofbuid":null,"dittousername":null,"thingname":"Palm Springs, CA"},{"added":"2008-11-22 22:54:15","tid":"3455","dittokey":"0","mykey":null,"dittouser":null,"dittofbuid":null,"dittousername":null,"thingname":"Hilton Head Island, SC"},{"added":"2008-11-22 22:54:15","tid":"3456","dittokey":"0","mykey":null,"dittouser":null,"dittofbuid":null,"dittousername":null,"thingname":"Columbia, SC"}]}]} ,{"uid":"18","username":"Greg Guthrie","fbuid":"4700900","lists":[{"lid":"222","listname":"Movies I Want to Watch","items":[{"added":"2008-11-22 22:54:15","tid":"229","dittokey":"0","mykey":null,"dittouser":null,"dittofbuid":null,"dittousername":null,"thingname":"I am Sam"},{"added":"2008-11-22 22:54:15","tid":"283","dittokey":"0","mykey":null,"dittouser":null,"dittofbuid":null,"dittousername":null,"thingname":"Arrested Development: Season 3"},{"added":"2008-11-22 22:54:15","tid":"223","dittokey":"0","mykey":null,"dittouser":null,"dittofbuid":null,"dittousername":null,"thingname":"Sling Blade"},{"added":"2008-11-22 22:54:15","tid":"224","dittokey":"0","mykey":null,"dittouser":null,"dittofbuid":null,"dittousername":null,"thingname":"Braveheart"},{"added":"2008-11-22 22:54:15","tid":"225","dittokey":"0","mykey":null,"dittouser":null,"dittofbuid":null,"dittousername":null,"thingname":"Shawshank Redemption"}]}]} ,{"uid":"0","username":"Stranger","fbuid":"0","lists":[{"lid":"2851","listname":"Simple Pleasures","items":[{"added":"2008-11-22 22:54:15","tid":"3691","dittokey":"0","mykey":null,"dittouser":null,"dittofbuid":null,"dittousername":null,"thingname":"streching when tired"},{"added":"2008-11-22 22:54:15","tid":"3694","dittokey":"0","mykey":null,"dittouser":null,"dittofbuid":null,"dittousername":null,"thingname":"scooping soft ice cream"},{"added":"2008-11-22 22:54:15","tid":"3691","dittokey":"0","mykey":null,"dittouser":null,"dittofbuid":null,"dittousername":null,"thingname":"streching when tired"},{"added":"2009-01-23 03:38:08","tid":"6286","dittokey":"0","mykey":null,"dittouser":null,"dittofbuid":null,"dittousername":null,"thingname":"using an automatic faucet with water that is the perfect temperature"},{"added":"2008-12-17 18:15:58","tid":"6286","dittokey":"0","mykey":null,"dittouser":null,"dittofbuid":null,"dittousername":null,"thingname":"using an automatic faucet with water that is the perfect temperature"},{"added":"2009-06-25 16:30:17","tid":"6748","dittokey":"0","mykey":null,"dittouser":null,"dittofbuid":null,"dittousername":null,"thingname":"Getting a close parking spot in a crowded lot"}]},{"lid":"2874","listname":"Famous People I've Seen Around","items":[{"added":"2008-11-22 22:54:15","tid":"3797","dittokey":"0","mykey":null,"dittouser":null,"dittofbuid":null,"dittousername":null,"thingname":"Brian Baumgartner"},{"added":"2008-11-22 22:54:15","tid":"4159","dittokey":"0","mykey":null,"dittouser":null,"dittofbuid":null,"dittousername":null,"thingname":"Leann Rimes"},{"added":"2009-01-23 03:38:42","tid":"6323","dittokey":"0","mykey":null,"dittouser":null,"dittofbuid":null,"dittousername":null,"thingname":"Arnold Morning"},{"added":"2008-12-20 07:28:31","tid":"6288","dittokey":"0","mykey":null,"dittouser":null,"dittofbuid":null,"dittousername":null,"thingname":"Rafael Nadal"},{"added":"2008-11-22 22:54:15","tid":"6194","dittokey":"0","mykey":null,"dittouser":null,"dittofbuid":null,"dittousername":null,"thingname":"Jon Voight"},{"added":"2008-11-22 22:54:15","tid":"355","dittokey":"0","mykey":null,"dittouser":null,"dittofbuid":null,"dittousername":null,"thingname":"Ben Folds"},{"added":"2009-01-25 06:19:54","tid":"6357","dittokey":"0","mykey":null,"dittouser":null,"dittofbuid":null,"dittousername":null,"thingname":"James Marsden"},{"added":"2008-11-22 22:54:15","tid":"6195","dittokey":"0","mykey":null,"dittouser":null,"dittofbuid":null,"dittousername":null,"thingname":"Randy White"},{"added":"2008-11-22 22:54:15","tid":"2879","dittokey":"0","mykey":null,"dittouser":null,"dittofbuid":null,"dittousername":null,"thingname":"Jay Cutler"},{"added":"2009-02-26 15:31:24","tid":"6434","dittokey":"0","mykey":null,"dittouser":null,"dittofbuid":null,"dittousername":null,"thingname":"Steve Zahn"}]}]} ];
  
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
   //  console.log("Load Lists - Could also refresh.");
    dbFactory.getUserListOfLists($rootScope.vars.user.userId,'$rootScope.lists');
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

.controller('LoginCtrl', function($scope, $window, Facebook, $rootScope, $state) {
  /* 
  $scope.force = function(){
    $rootScope.token = 'ae6d5d593f59d15652109f88edaea72a'; 
  };
  */
  
  $scope.loginOAuth = function(provider) {
    // TODO1 - This is the bit that handles the login.
    if(provider === 'facebook'){
      // Do that.
      $scope.message = "Logging in with Facebook";
      // 
      $state.go('loading');      // TODO 1 - Is this working?
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
