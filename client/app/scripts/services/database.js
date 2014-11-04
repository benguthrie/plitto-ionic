'use strict';
angular.module('Services.database', [])

// This will handle storage within local databases.
.factory('dbFactory', ['$http', '$rootScope', 'localStorageService', '$state', function ($http, $rootScope, localStorageService, $state) {
      
 var apiPath = (window.cordova) ? 'http://plitto.com/api/2.0/' : '/api/2.0/';

/* 11/2/2014 */
  var checkToken = function(token){
    // console.log('check the token to see if we should proceed.');
    if(typeof token ==='undefined' || token.length === 0){
      $state.go('login');
      $rootScope.init();
    }
      
  }
  
/* 10/22/2014 */

var showFeed = function (theType, userFilter, listFilter, myState, oldestKey) {
  var params = $.param({theType: theType, userFilter: userFilter, listFilter: listFilter, myState: myState, oldestKey: oldestKey, token: $rootScope.token });

// Is there currently a reed?
// console.log('showFeed params: ',params);

  $http({
    method: 'POST',
    url: apiPath + 'showFeed', 
    data: params,
    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
  })
  .success(function (data, status, headers, config) {
    if (theType === 'profile') {
      $rootScope.profileData.feed = data.results;
    }
  // console.log("profile feed after showfeed",$rootScope.profileData.feed);
  });

}    
    
/* 11.3.2014 */
var showUser = function (userId, userName, dataScope) {
  
    // 
  console.log('dbFactory: show a user. vars.user: ', userId, ' uid: ',userId,' username: ',userName, 'dataScope', dataScope);
  $rootScope.profileData = {
    userName: userName,
    userId: userId,
    lists: [],
    ditto: [],
    feed: [],
    shared: []
  };

  // Get something to ditto 
  if($rootScope.user.userId != userId){
    dbGetSome('$rootScope.profileData.ditto', userId, '', 'ditto');
    $rootScope.nav.view = "user.ditto";
  } else {
    // This is me
    
    // dbGetSome('$rootScope.profileData.feed', userId, '', 'all');
    showFeed('profile', '1', 'listFilter', '', '');
    $rootScope.nav.view = "user.feed";
  }
  
  
  
  getUserListOfLists(userId, '$rootScope.profileData.lists');

  // dbFactory.showUser(userId);
  //dbGetSome = function (theScope, userfilter, listfilter, sharedFilter)
  $state.go('app.profile',{userId: userId});
  
};
    
/* 10/4/2014, 11/3/2014 */
var showThing = function (thingId, thingName, userFilter) {
  // Clear out the rootScope.thingData to show a new thing.
  $rootScope.thingData = {thingId: thingId, thingName: thingName, items: []};
  $rootScope.nav.view = 'thing'; // To disable link when in thing view.
  $state.go('app.thing',{thingId: thingId});
        
  // $rootScope.vars.modal.filter = 'all';
  var thingParams = $.param({token: $rootScope.token, thingId: thingId });
  $http(
    {
      method:'POST',
      url: apiPath + 'thingDetail', 
      data: thingParams ,
      headers: {'Content-Type':'application/x-www-form-urlencoded'}
  })
  .success(function (data,status,headers,config) {
  
    // $rootScope.modal.listStore = data.results;
    $rootScope.thingData.items = data.results;
    
    console.log('rs.td.items',$rootScope.thingData);
  } );
    
};

/* 10/3/2014 - Search */
var search = function (searchTerm) {
  var searchParams = $.param({token: $rootScope.token, search: searchTerm });

  $http(
    {
      method:'POST',
      url: apiPath + 'search', 
      data: searchParams ,
      headers: {'Content-Type':'application/x-www-form-urlencoded'}
  })
  .success(function (data,status,headers,config) {
  
    $rootScope.searchResults = data.results;

      // For the user and the list, change the increments of dittoable and in common.
  } );
};

    
    
/* 9/4/2014 - 9/3/2014 - Handle the ditto action 
    10/21/2014 - Vastly improved this.
*/

// dbFactory.dbDitto('bite',i,j,k,mykey,uid,lid,tid);      
      
var dbDitto = function (scopeName, mykey, uid, lid, tid, event ) {
  //  console.log('dbFactory.dbDitto | mykey: ', mykey,'| ownerid: ', uid, '| listid: ',lid, tid,i,j,k);
  var i,j,k;

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

// Update the action, by whether or not the first item is null or not.
if(mykey === null) {
  // My key is null, so this must be a ditto.
  // console.log('update action ditto', mykey, parseInt(mykey));
  var action = 'ditto';
  } else {
  // I have a key, and need to remove this item.
  var action = 'remove';
}

 var dittoParams = $.param(
     {
        action: action ,
        listid: lid, 
         fromuserid: uid, 
         thingid: tid, 
         token: $rootScope.token });

  $http(
    {
      method:'POST',
      url: apiPath + 'ditto', 
      data: dittoParams ,
      headers: {'Content-Type':'application/x-www-form-urlencoded'}
  })
  .success(function (data,status,headers,config) {
    // console.log("ditto response: ",data,'mykey',data.results[0]['thekey']);

    if(action === 'ditto') {
    /* NO NEED FOR THESE
      var thingname = data.results[0]['thingname'];
      var listname = data.results[0]['listname'];
    */
      var mynewkey  = data.results[0]['thekey'];
      var friendsWith = data.results[0]['friendsWith'];

      // Update the "Friends With" 
      $(event.target).html(friendsWith);

      // For the user and the list, change the increments of dittoable and in common.
    } else {
      // It was removed. Finalize that.
      var mynewkey = null;
        $(event.target).html("");
    }

    // Update my key within the correct scope.
    // Results update
   //  console.log('rs sn: ',scopeName, $rootScope[scopeName]);
      // $rootScope[scopeName][i].lists[j].items[k].mykey = mynewkey;
      eval('$rootScope.' + scopeName + '[i]["lists"][j]["items"][k].mykey = ' +mynewkey);
      
  });

};

/* Get Some - things to ditto 
  9/23/2014 - Created 
*/
var dbGetSome = function (theScope, userfilter, listfilter, sharedFilter) {
  // 
  console.log('getSomeDB Scope: ',theScope, ' listfilter: ', listfilter ,' userfilter: ',userfilter, ' sharedFilter ', sharedFilter);
  // SharedFilter: 
  checkToken($rootScope.token);
    
  var params = {
    type:'user',
    userFilter: userfilter,
    listFilter: listfilter,
    token: $rootScope.token,
    sharedFilter: sharedFilter
    
  };
// Fails: dbGetSome params Object {userfilter: "", listfilter: ""} 

  //  console.log('dbGetSome params',params);

  $http({
      method: 'POST',
      url: apiPath + 'getSome',
      data: $.param(params),
      headers: {'Content-Type':'application/x-www-form-urlencoded'}
    })
    .success(function (data,status,headers,config) {
    
      if(data.error) {
        // Log out now.
        if(data.errortxt === 'missing token') {
          // console.log('invalid token. log out.');
          $rootScope.logout();
        } else {
          // console.log('unknown error.');
        }
        
      } else {
        // eval('console.log("net Results",' + theScope +');'); 
        // This makes the scope that was passed in that part of the root scope.
        eval(theScope + ' = data.results;');
        
        // Testing returning it so it can be part of the rootScope:
        // return data.results;
      }
      // console.log('dbFactory.getActivity data: ',data);
      
    });
};

/* Created 11/2/2014 */
var fbTokenLogin = function(fbToken){
  // The user has a valid Facebook token for plitto, and now wants to log into Plitto
  // Send the token to Plitto, which handles all Facebook communication from the PHP layer.
   var loginParams = $.param( { fbToken: fbToken } );
      $rootScope.message = $rootScope.message + ' dbFactory.fbTokenLogin Called';          
    $http({
      method:'POST',
      url: apiPath + 'fbToken', 
      data: loginParams ,
      headers: {'Content-Type':'application/x-www-form-urlencoded'}
    })
    .success(function (data, status,headers,config) {
      // Initialize the rootScope.
      $rootScope.init();
      console.log('fbTokenLogin response: ',data);
      $rootScope.message = $rootScope.message + ' dbFactory.fbTokenLogin Responded ';
      // console.log('response from fbToken: ',data);
      // data.me.puid is the plitto userid. That should be there.
      if( /^\+?(0|[1-9]\d*)$/.test(data.me.puid)){
        console.log("puid is valid");
        // Set the stores.
        $rootScope.user = { userId: data.me.puid, userName: data.me.username, fbuid: data.me.fbuid };
        
        localStorageService.set('user', $rootScope.user );
        
        // Make the root token and the Local Storage
        $rootScope.token = data.me.token;
        localStorageService.set('token', data.me.token);
        
        // Make the root token and the Local Storage
        $rootScope.friendStore = data.friends;
        localStorageService.set('friendStore', data.friends);

        //   console.log('the token: ',$rootScope.token, 'friend store: ',$rootScope.friendStore);

        // Populate the initial "Ditto Some" view
        $rootScope.bite = data.getSome;
        localStorageService.set('bite', data.getSome);
        
        //  console.log('get some goes into $rootScope.bite',$rootScope.bite);

        // FINALLY! - Load the interface
        $state.go('app.home');

      }else{
        console.log("TODO1 There was an error. Log it.");
      }

    } );
};  
  
  
/* 

pre 9/3/2014 
updated 10/21/2014  - 
Should be able to be removed on 11/4/2014
*/
  // This is called AFTER a valid OAuth login
var plittoLogin = function (meResponse, friendsResponse) {
  // console.log('plitto login',fbResponse);
  var params = $.param( {fbMe: meResponse, fbFriends: friendsResponse} );

  // Receive the handoff from Facebook, if we have a redirect URL to intercept.
  if( window.location.search.replace("?", "") ) {
    var gets = window.location.search.replace("?", "");
    // console.log('dbFactory.plittoLogin: gets: ',gets); 
    location.replace('/');
  }

  $http(
    {
      method:'POST',
      url: apiPath + 'fbLogin',  
      data: params,
      headers: {'Content-Type':'application/x-www-form-urlencoded'}
  })
  .success(function (data,status,headers,config) {
      // Initialize the rootScope.
     $rootScope.init();
    // Handle the users, lists and things.
      
    // console.log('Yo. Diego. Check out the full data response from the fbLogin api call: ',data);

    //$rootScope.session.plittoState = 'Plitto Response Confirmed. Interface Loading.';
      // Get their friends
    if( typeof parseInt(data.me.puid) ==='number') {
      // User can log in
      // Initialize the scope settings.

      $rootScope.user = { userId: data.me.puid, username: data.me.username, fbuid: data.me.fbuid };  // The API determines the value of this.
    
        // Set up the token
        $rootScope.token = data.me.token;
        localStorageService.set('token', data.me.token);
        $rootScope.friendStore = data.friends;
      
        localStorageService.set('friendStore', data.me.token);
      
        
      //   console.log('the token: ',$rootScope.token, 'friend store: ',$rootScope.friendStore);
        
        // Populate the initial "Ditto Some" view
        $rootScope.bite = data.getSome;
       //  console.log('get some goes into $rootScope.bite',$rootScope.bite);
      
      // FINALLY! - Load the interface
      $state.go('app.home');
        
    } else {
      // TODO2 - Present errors somewhere.
    }

    // Update the window sizes
    // gotResized();

  });
};

/* Gets their Plitto Friends, and adds it to the local store. 9/3/2014
    // 10/21/2014 This will only be called on a refresh, which isn't built yet.
*/
var fbPlittoFriends = function (server) {
  // Make the API call to get this user's friends.
  // console.log('rs server',$rootScope.server);
    
     $rootScope.nav.logging = false;
    // TODO0 - This needs to work.
    FB.api('/me/friends', function (response) {
      // console.log('my friends: ',response.data);
      // Using this, call the Plitto API to log this users friends
      plittoFBApiCall(response.data);
    });
};


// Makes the API call to load the friends.
var plittoFBApiCall = function (friendsData) {
  // FriendsData could be null. What happens then?

  // Load from local storage, if it's there, then update it.
  $rootScope.friendStore = localStorageService.get('friendStore');

  // Only request their friends if they have more than 0.
  if(friendsData.length > 0) {

  var params = $.param( { fbFriends: friendsData } );
      $http(
        {
          method:'POST',
          url: apiPath+'pFriends', 
          data: params,
          headers: {'Content-Type':'application/x-www-form-urlencoded'}
      })
      .success(function (data,status,headers,config) {
          // Handle the users, lists and things.
          // Add it to the scope, so it can be shown
          $rootScope.friendStore = data.result;

          // Update the local storage.
          localStorageAppend('fbLogin',data.result);

        });
  } else {
    var response = 'You should invite your friends to Plitto';
    // console.log('response',response);
  }
};



/* 9/7/2014
  Get the list of lists for this user
*/
var getUserListOfLists = function (friendId, theScope) {
    // TODO2 - load from local storage, if it's there 
  console.log('getUserListOfLists: friendId: ',friendId,' theScope: ', theScope);  
  
  var params = $.param({userfilter:friendId, token: $rootScope.token });
  // console.log('listoflists params: ',params);
  $http({
        method:'POST',
        url: apiPath + 'listOfLists', 
        data: params,
        headers: {'Content-Type':'application/x-www-form-urlencoded'}
    })
    .success(function (data,status,headers,config) {
      // console.log("testlogin: ",data, data.puid);
      // Handle the users, lists and things.
        // Update the rootScope lists.
      // TODO - Come up with a strategy of where to store this better than Rootscope. Also, for each user, when navigating around, this could change.
       //  $rootScope.lists = data.result;
      console.log('Load this here: ',theScope + ' = data.results;');
      eval(theScope + ' = data.results;');
    // console.log('rootscope.lists', $rootScope.lists);

        // Add / Update to local storage
        localStorageService.set('userLL_'+friendId, data.result);
      });
};


/* 9/7/2014
   Find shared if we don't know it.
*/
var sharedStat = function (friendId) {
  // console.log('dbFactory.sharedState',friendId,$rootScope.friendStore);
  var friendStore = localStorageService.get('friendStore');
  //This will be in local storage, and in the friendStore.
  for(i in friendStore) {
    // console.log('sharedStat loop');
    if(parseInt(friendStore[i].id) === parseInt(friendId)) {
      $rootScope.vars.modal.user.shared = friendStore[i].shared;
      $rootScope.vars.modal.user.dittoable = friendStore[i].dittoable;
      // console.log('found 32',$rootScope.vars.modal.user.shared , friendStore[i].shared);
      {break}
    }
  }
}
// Add to a list.
var addToList = function (addToListObj) {
  var addToListParams = $.param({thingName: addToListObj.thingName,
      listnameid: addToListObj.lid , token: $rootScope.token } );
  // console.log('dbFactory.addToList | ',addToListParams);
   $http(
      {
        method:'POST',
        url: apiPath + 'addToList', 
        data: addToListParams ,
        headers: {'Content-Type':'application/x-www-form-urlencoded'}
    })
    .success(function (data,status,headers,config) {
      //
      // console.log("addtolistdata: ",data);
      // console.log('detailed',data.results[0].thekey);
      // Add it to the RootScope.
      // console.log('added a new item: ',data)
      var item = data.results[0];

      var myNewItem = {
        mykey: item.thekey,
        tid: item.thingid,
        thingname: item.thingname,
        added: 'now',
        dittokey: 0,
        dittouser: null,
        dittousername: null

      };

      // Placeholder for existing list.

      var myThingAlready = -1;

      var i = 0;

      for(i in $rootScope.list.mine[0].lists[0]){
        if($rootScope.list.mine[0].lists[0].tid === item.thingid){
          myThingAlready = i;
        }
      }


      // console.log('didList',didList, 'myListPosition', myListPosition, 'myThingAlready', myThingAlready);

      // If my list doesn't exist yet, create it.
      if($rootScope.list.mine.length === 0) {
        // Make my list.
        var myList = {
          uid: $rootScope.user.userId,
          fbuid: $rootScope.user.fbuid,
          username: $rootScope.user.username,
          lists: [ { lid: addToListObj.lid, listname: $rootScope.list.listName, items: [ myNewItem ] } ]
        };
        // Make my list first // TODO1 - This needs to work
        $rootScope.list.mine = myList;

      } 
      else {

      // Add my item to my list, but only if it's not already there.
      if(myThingAlready === -1) {
        // console.log($rootScope.modal.listStore[0]);

        // console.log('RootStore before I build', $rootScope.list.items);
        $rootScope.list.mine[0].lists[0].items.unshift(myNewItem);
      } else {
        // Move my old item to the top of your list.
        // console.log('move it from one place to first',myThingAlready);
        // Remove the old item
        $rootScope.list.mine[0].lists[0].items.splice(myThingAlready, 1);
        // Insert the new one with "now"
        $rootScope.list.mine[0].lists[0].items.unshift(myNewItem);
      }

      /* End the Success Function */
    }
 });
};


/* Removed this 11/4/2014 
var modalReset = function () {
  // console.log("dbFactory.modalReset");
  // STEP 1 - Clear out any listStore filters applied within this user profile.
  for(i in $rootScope.listStore) {
    // Check each list to see if it's mine. Hide it if it's mine.
    if(parseInt($rootScope.listStore[i].uid) === $rootScope.vars.user.userId) {
      $rootScope.listStore[i].show = "0";
      
    } else {
      
      // Only go through the items if it's someone else's list.
      $rootScope.listStore[i].show = "1";
      for(j in $rootScope.listStore[i].items) {
        $rootScope.listStore[i].items[j].show = "1"; 
        // console.log('Show'+ $rootScope.listStore[i].username + "'s " + $rootScope.listStore[i].listname + ' item' + $rootScope.listStore[i][j]) 
      }
    }
  }
};

*/
    
/* 9/3/2014 */
var showAList = function (listNameId, listName, userFilter) {
  // 
  console.log('showAList: ',listNameId, listName , userFilter);
  
  $rootScope.list = { listId: listNameId, listName: listName, ditto:[], shared:[], feed:[], strangers:[]};
  $rootScope.nav.listView = 'ditto';
  $state.go('app.list',{listId: listNameId});
  
  var existing = [];    
  // getMore ('list',listNameId, userFilter, existing);
  loadList(listNameId, listName, userFilter, 'all', 'all')
  
};  

/* Populate a list with all the different views, if they're there. */
var loadList = function(listNameId, listName, userIdFilter, type, sharedFilter, oldestKey){
  
  var params = $.param({
    id: listNameId,
    type: type,
    token: $rootScope.token,
    userIdFilter: userIdFilter,
    oldestKey: oldestKey,
    sharedFilter: sharedFilter
    
  });
  $http({
    method: 'POST',
    url: apiPath + 'loadList',
    data: params,
    headers: {'Content-Type':'application/x-www-form-urlencoded'}
  }).success(function(data, status, headers, config){
    if(typeof data.results.ditto != 'undefined' && data.results.ditto.length > 0)     
      { $rootScope.list.ditto = data.results.ditto; } 
      else if(typeof data.results.ditto != 'undefined' && data.results.ditto.length === 0)
        // Clean out the store if there were no results
      { $rootScope.list.ditto = []; } 
    
    if(typeof data.results.shared != 'undefined' && data.results.shared.length > 0)    
      { $rootScope.list.shared = data.results.shared; }
      else if(typeof data.results.shared != 'undefined' && data.results.shared.length === 0)
        // Clean out the store if there were no results
      { $rootScope.list.shared = []; } 
    
    if(typeof data.results.feed != 'undefined' && data.results.feed.length > 0)      
      { $rootScope.list.feed = data.results.feed; }
      else if(typeof data.results.feed != 'undefined' && data.results.feed.length === 0)
        // Clean out the store if there were no results
      { $rootScope.list.feed = []; } 
    
    if(typeof data.results.mine != 'undefined' && data.results.mine.length > 0)      
      { $rootScope.list.mine = data.results.mine; }
      else if(typeof data.results.mine != 'undefined' && data.results.mine.length === 0)
        // Clean out the store if there were no results
      { $rootScope.list.mine = []; } 
    
    if(typeof data.results.strangers != 'undefined' && data.results.strangers.length > 0) 
      { $rootScope.list.strangers = data.results.strangers; }
    else if(typeof data.results.strangers != 'undefined' && data.results.strangers.length === 0)
        // Clean out the store if there were no results
      { $rootScope.list.strangers = []; } 
    console.log('type: ',type,' listNameId: ', listNameId, ' listName: ', listName, ' userIdFilter: ', userIdFilter, 'Success? rs.list: ',$rootScope.list);
  });
  
}

/* 9/3/2014 / 9.5.2014
  This function gets more content for a user or a list.
 */
var getMore = function (type, id, ownerid, existing) {
    var params = $.param({
        type: type,
        id: id,
        uid: ownerid,
        existing: existing,
        token: $rootScope.token
    });
  // 
  // 
  console.log('getMoreparams: ',params);
  $http(
    {
      method:'POST',
      url: apiPath + 'getMore', 
      data: params ,
      headers: {'Content-Type':'application/x-www-form-urlencoded'}
  })
  .success(function (data,status,headers,config) {
    // Append the data to the proper place.
    // console.log('data.results size',data.results,data.results.length);

    // TODO1 - Add it to the correct store. getMoreAppend('getMoreAppendSuccess',params,data.results, id);

    // Put it in the listStore if we know what it is
    if(type==="list") {
      $rootScope.list.items = data.results;
      // $rootScope.list.itemCount = data.results.length;
      
      console.log("rootScope.list built by getMore: ",$rootScope.list.items);
      
    } else if(type==="user") {
      console.log("TODO1 - Build the place to store user information");
    }
    
  });
};


/* 9/6/2014 - 
  Get more must append the results, not just overwrite them 
  9/17/2014 - Building it to append. 
*/
var getMoreAppend = function (caption,params,data, id) {
  // Step 1. Get the key that should be in place for the local storage.
  if($rootScope.nav.modal === true && $rootScope.nav.filter === "user") {
    var thefilter = 'modalUser';
    var thekey = 'userL_' + $rootScope.nav.filterId;
    gma = localStorageService.get(thekey);
    if(gma && gma.length > 0) {
      $rootScope.modal.listStore = gma;
    } else {
      gma = [];
    }
  

  } 
  else if ($rootScope.nav.modal === true && $rootScope.nav.filter ==="list") {
    var thefilter = 'modalList';
    var thekey = 'listL_' + $rootScope.nav.filterId;
    console.log('list local storage key: ' , thekey, data);

    // Existing
    var existingList = localStorageService.get(thekey);
    if(existingList) {
      console.log('list exists');
      gma = existingList;
      $rootScope.modal.listStore = gma;
    }else{
      console.log('list is null');
      gma = [];
      $rootScope.modal.listStore = gma;
    }    
  }
  else {
    gma = [];
  }

  // console.log('starting GMA',gma);

  // 
  // console.log('dbFactory.getMoreAppend | params, data', params, data,'listStore start',$rootScope.modal.listStore, 'full scope',$rootScope);
  
  // Set the scope for processing.
  
  var shouldAppend = true;

  // Process the correct scope.
  if($rootScope.nav.modal === true) {
    if(!$rootScope.modal.listStore || $rootScope.modal.listStore.length === 0) {
      // It was empty, so make it this data.
      $rootScope.modal.listStore = data;
      console.log("Don't append because the liststore is false, or it's 0.", !$rootScope.modal.listStore,$rootScope.modal.listStore.length);
      shouldAppend = false;


      // Update the local storage.
      // var localKey = $rootScope.nav.filter + 'L_' + $rootScope.nav.filterid;
      if(thekey) {
        console.log("SET THE KEY",thekey);
         localStorageService.set(thekey,data);
      }   

    } else {
      gma = $rootScope.modal.listStore;
    }
  }  else {
    if($rootScope.activityStore.length === 0) {
      console.log("Don't append because the activity store is empty.");
      shouldAppend = false;
      $rootScope.activityStore = data;
    } else {
      gma = $rootScope.activityStore;
    }
  }
  // console.log('gma rootscope',' shouldAppend: ',shouldAppend);

  if(shouldAppend=== true) {
    // console.log('move to append','gma: ',gma);

    // Look at the existing content to seed matches.
    var userLists = [];
    for(i in gma) {
      for(j in gma[i].lists) {
        userLists.push( { i: i, j: j, uid: gma[i].uid, lid: gma[i].lists[j].lid , used: false } );
      }
    }

    // console.log('userLists:',userLists);
    // PROBLEM - One list is being added four times rather than being appended to an existing list once..

    for(i in data) {
      // Inside the user loop.
      for(j in data[i].lists) {
        // Inside the list loop

        // Check existing for matches.
        for(z in userLists) {
          //console.log('append',parseInt(userLists[z].uid) , parseInt(data[i].uid) , parseInt(userLists[z].lid) , parseInt(data[i].lists[j].lid) );
          if(userLists[z].uid === data[i].uid 
              && userLists[z].lid === data[i].lists[j].lid ) {
            // console.log('matched existing.',data[i].lists[j].items);
            //
            console.log('to push to',            gma[userLists[z].i].lists[userLists[z].j].items); 
            console.log('add these items',data[i].lists[j].items);
            console.log('positions: ',i,j)
            gma[userLists[z].i].lists[userLists[z].j].items.push.apply(
              gma[userLists[z].i].lists[userLists[z].j].items, 
              data[i].lists[j].items );
         
            userLists[z].used = true;
            data[i].lists[j].used = true;
          } 
        }
        /*
        for(k in data[i].items[j]) {

        } */
      }
    }

    // Process lists that are new. Anything with .used === false hasn't been added yet.
    console.log('unused items? userlists, data: ',userLists, data);
    // Data that is false can just be added, methinks.

    if(thefilter==='modalUser') {
      for(i in data[0].lists) {
        // Push each list onto the scope if it wasn't already used..
        if(data[0].lists[i].used === false) {
          gma[0].lists.push(data[0].lists[i]);
        }
        
      }
    } else if (thefilter === 'modalList') {
      console.log('userLists,data',userLists,data);
      for(i in data) {
        // Inside the User part.
        console.log('dataused',data[i].lists[0].used);
        if(data[i].lists[0].used === false) {
          // We have content for a user, but didn't append it before. Create this list for the user.
          gma.push(data[i]);
        }
      }
    }

    // Update the proper scope.
    if(thefilter === 'modalUser' || thefilter==='modalList') {
      $rootScope.modal.listStore = gma;
      // Update the localStorage.
      localStorageService.set(thekey,gma);
    }


  }


  
  // Update the local storage.

}


var newList = function (thingName, success, failure) {
  // Query the API and make the thing, if it needs to be made.
  var thingParams = $.param({thingName: thingName });
        $http({
            method:'POST',
            url:apiPath + 'thingid',
            data: thingParams,
            headers: {'Content-Type':'application/x-www-form-urlencoded'}
        })
        .success(function (data,status,headers,config) {
          // 
          var newListId = data.results[0]['thingid'];
            // 
            console.log("New List ID: ",newListId, 'thingname: ',thingName);
          
            // Callback - On creating the new list.
            success(newListId, thingName);          
      });

};
  
/* 11.4.2014 - Updates friends, lists, user info on app re-launch */
var refreshData = function(token){
  // This function will be called when the app loads, and already has a token. It's kind of like login.
  
  // Populate profile information
  if(localStorageService.get('user'))
    {
      $rootScope.user = localStorageService.get('user');
    }
  
  // Populate the friendstore.
  if(localStorageService.get('friendStore')){
    $rootScope.friendStore = localStorageService.get('friendStore');
  }
  
  // Populate the bite.
  if(localStorageService.get('bite')){
    $rootScope.bite = localStorageService.get('bite');
  } 
  
  // TODO2 Now, make the HTTP calls to refresh them.
  
  
  
  
  
  
};

return {
  plittoLogin: plittoLogin
  , fbPlittoFriends: fbPlittoFriends
  , plittoFBApiCall: plittoFBApiCall
  , dbGetSome: dbGetSome
  , dbDitto: dbDitto
  , getUserListOfLists: getUserListOfLists
  , sharedStat: sharedStat /* 9/7/2014 */
  // , modalReset: modalReset
  , showAList: showAList
  , getMore: getMore
  , getMoreAppend: getMoreAppend
  , newList: newList
  , addToList: addToList
  , search: search
  , showThing: showThing
  , showUser: showUser
  , showFeed: showFeed
  , loadList: loadList
  , fbTokenLogin: fbTokenLogin
  , refreshData: refreshData
};
  
}]);
