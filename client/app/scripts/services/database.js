'use strict';
angular.module('Services.database', [])

// This will handle storage within local databases.
.factory('dbFactory', ['$http', '$rootScope', 'localStorageService', '$state', function ($http, $rootScope, localStorageService, $state) {
      
 var apiPath = (window.cordova) ? 'http://plitto.com/api/2.0/' : 'http://localhost/api/2.0/';
//var apiPath = '/api/2.0/';
      
/* 10/22/2014 */


var showFeed = function (theType, userFilter, listFilter, myState, oldestKey) {
  var params = $.param({theType: theType, userFilter: userFilter, listFilter: listFilter, myState: myState, oldestKey: oldestKey, token: $rootScope.token });

// Is there currently a reed?
// console.log('showFeed params: ',params);

  $http(
    {
      method: 'POST',
      url: apiPath + 'showFeed', 
      data: params,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }
  )
  .success(function (data, status, headers, config) {
    if (theType === 'profile') {
      $rootScope.profileData.feed = data.results;
    }
  // console.log("profile feed after showfeed",$rootScope.profileData.feed);
  });

}    
    
var showUser = function (userId) {
  $rootScope.profileData.lists = [];
  getSome('profile',userId,'ditto');
  getUserListOfLists(userId, 'profileData.lists');              
};
    
/* 10/4/2014 */
var showThing = function (thingId, thingName, userFilter) {
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

    // console.log($rootScope.modal.listStore);

      // For the user and the list, change the increments of dittoable and in common.
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
      
var dbDitto = function (scopeName, i,j,k, mykey, uid, lid, tid, event ) {
  //  console.log('dbFactory.dbDitto | mykey: ', mykey,'| ownerid: ', uid, '| listid: ',lid, tid,i,j,k);

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
  // console.log('getSomeDB Scope: ',theScope,' userfilter: ',userfilter,' listfilter: ',listfilter);

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
        eval(theScope + ' = data.results;');
      }
      // console.log('dbFactory.getActivity data: ',data);
      
    });
};


/* 

pre 9/3/2014 
updated 10/21/2014  - 

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
      
      

    $rootScope.session.plittoState = 'Plitto Response Confirmed. Interface Loading.';
      // Get their friends
    if( typeof parseInt(data.me.puid) ==='number') {
      // User can log in
      // Initialize the scope settings.

      $rootScope.vars.user = { userId: data.me.puid, username: data.me.username, fbuid: data.me.fbuid };  // The API determines the value of this.
    
        // Set up the token
        $rootScope.token = data.me.token;
        localStorageService.set('token', data.me.token);
        $rootScope.friendStore = data.friends;
        
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
    var didList = 0;
    var myListPosition = -1;
    var myThingAlready = -1;

    // Updated to the new data Context 9/16/2014
    // Find my list position within other user's lists.
    
     
// console.log('rs.list',$rootScope.list, $rootScope.list.items);
var i = 0, j=0;
    for(i in $rootScope.list.items) {
      // console.log('652 - rs.list.items',$rootScope.list.items[i],i);
      if($rootScope.list.items[i].uid === $rootScope.vars.user.userId) {
        console.log("Found my list at position",i );
        myListPosition = i;
        // We can assume that is the the first list, since there can only be one showing.
        for(j in $rootScope.list.items[i].lists[0].items) {
          if($rootScope.list.items[i].lists[0].items[j].tid === item.thingid) {
            myThingAlready = j;
          }
        }
      }
    }

    // console.log('didList',didList, 'myListPosition', myListPosition, 'myThingAlready', myThingAlready);

    // This section will make my list and make it first in the order.
    if(myListPosition === -1) {
      // Make my list.
      var myList = {
        uid: $rootScope.vars.user.userId,
        fbuid: $rootScope.vars.user.fbuid,
        username: $rootScope.vars.user.username,
        lists: [ { items: [] } ]
      };
      // Make my list first // TODO1 - This needs to work
      $rootScope.list.items.unshift(myList);

    } 
    else {
      // Move my list list to first in the order.
      if(myListPosition !== 0) {
        var myList = $rootScope.list.items[myListPosition];

        $rootScope.list.items.splice(myListPosition, 1);
        $rootScope.list.items.unshift(myList);
      } 
      // Add my item to my list at the top.

    }

    // Add my item to my list, but only if it's not already there.
    // TODO2 - Highlight an item that is already there.
    if(myThingAlready === -1) {
      // console.log($rootScope.modal.listStore[0]);

      console.log('RootStore before I build', $rootScope.list.items);
      $rootScope.list.items[0].lists[0].items.unshift(myNewItem);
    } else {
      // Move my old item to the top of your list.
      console.log('move it from one place to first',myThingAlready);
      $rootScope.list.items[0].lists[0].items.splice(myThingAlready, 1);
      $rootScope.list.items[0].lists[0].items.unshift(myNewItem);
    }

    /* End the Success Function */
  });

  

};


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
    
/* 9/3/2014 */
var showAList = function (listNameId, listName, userFilter) {
  // 
    console.log('showAList: ',listNameId, listName , userFilter);
  
  $rootScope.list = { listId: listNameId, listName: listName, myItems: null , dittoable: null, shared: null, items: [] };
  
  var existing = [];    
  getMore ('list',listNameId, userFilter, existing);

  
};  


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
            // console.log("New List ID: ",newListId);
          
            // Callback - On creating the new list.
            success(newListId, thingName);          
      });

};

return {
  plittoLogin: plittoLogin
  , fbPlittoFriends: fbPlittoFriends
  , plittoFBApiCall: plittoFBApiCall
  , dbGetSome: dbGetSome
  , dbDitto: dbDitto
  , getUserListOfLists: getUserListOfLists
  , sharedStat: sharedStat /* 9/7/2014 */
  , modalReset: modalReset
  , showAList: showAList
  , getMore: getMore
  , getMoreAppend: getMoreAppend
  , newList: newList
  , addToList: addToList
  , search: search
  , showThing: showThing
  , showUser: showUser
  , showFeed: showFeed
};
  
}]);
