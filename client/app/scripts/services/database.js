'use strict';
angular.module('Services.database', [])



// This will handle storage within local databases.
.factory ('dbFactory', ['$http','$rootScope','localStorageService'
  , function ($http, $rootScope, localStorageService) {
      
var apiPath = 'http://plitto.com/api/2.0/';
      
/* 10/4/2014 */
var showThing = function(thingid){
  $rootScope.vars.modal.filter = 'all';
  var thingParams = $.param({token: $rootScope.token, thingid: thingid });
   $http(
    {
      method:'POST',
      url: apiPath + 'thingDetail', 
      data: thingParams ,
      headers: {'Content-Type':'application/x-www-form-urlencoded'}
  })
  .success(function(data,status,headers,config){
  
    $rootScope.modal.listStore = data.results;

    console.log($rootScope.modal.listStore);

      // For the user and the list, change the increments of dittoable and in common.
  } );
    
};

/* 10/3/2014 - Search */
var search = function(searchTerm){
  var searchParams = $.param({token: $rootScope.token, search: searchTerm });


  $http(
    {
      method:'POST',
      url: apiPath + 'search', 
      data: searchParams ,
      headers: {'Content-Type':'application/x-www-form-urlencoded'}
  })
  .success(function(data,status,headers,config){
  
    $rootScope.searchResults = data.results;

      // For the user and the list, change the increments of dittoable and in common.
  } );
    

};

/* 9/4/2014 - 9/3/2014 - Handle the ditto action */

var dbDitto = function (mykey, ownerid, listid, thingid , event ){
  //   
  console.log('dbFactory.ditto | mykey: ', mykey,'| ownerid: ', ownerid, '| listid: ',listid, thingid);
  // db{{list.lid}}_{{list.uid}}_{{list.tid}}


 // SET MY KEY TO PENDING by sending this.
  // TODO2 - This could be done without traversung the scope 
  updateMyKey('pending',listid, thingid, 0,0,0,null);

// Update the action, by whether or not the first item is null or not.
if(mykey === null || mykey === -1){
  // My key is null, so this must be a ditto.
  // console.log('update action ditto', mykey, parseInt(mykey));
  action = 'ditto';
  } else {
  // console.log('update action remove',mykey, parseInt(mykey));
  mykey = null;
  action = 'remove';
}

 var dittoParams = $.param({action: action ,
      listid: listid, fromuserid: ownerid, thingid: thingid, token: $rootScope.token });

  $http(
    {
      method:'POST',
      url: apiPath + 'ditto', 
      data: dittoParams ,
      headers: {'Content-Type':'application/x-www-form-urlencoded'}
  })
  .success(function(data,status,headers,config){
    // 
    console.log("ditto response: ",data,'mykey',data.results[0]['thekey']);
    // var thingid = data.results[0]['tid'];
    // var listid = data.results[0]['lid'];

    if(action === 'ditto'){

      var thingname = data.results[0]['thingname'];
      var listname = data.results[0]['listname'];
      var mykey  = data.results[0]['thekey'];
      var friendsWith = data.results[0]['friendsWith'];

      // $('span#db'+listid + '_' + ownerid + '_'+thingid).html('+' + friendsWith);
      // console.log('api results logic: ',action,listid,thingid, mykey, listname, thingname, friendsWith);
      // updateMyKey
      updateMyKey(action,
        listid,
        thingid, 
        mykey, 
        listname, 
        thingname, 
        friendsWith,ownerid);

      // Update the "Friends With"
      $(event.target).html(friendsWith);

      // For the user and the list, change the increments of dittoable and in common.
    } else {
      // It was removed. Finalize that.
      updateMyKey(action,listid,thingid, null, 0, 0, null, ownerid);
    }

    // Now, update the text inside that element.
  });

};

/* Get Some - things to ditto 
  9/23/2014 - Created
*/
var dbGetSome = function(thescope, userfilter, listfilter){
  console.log('getSomeDB');

  var params = {
    userfilter: userfilter,
    listfilter: listfilter,
      token: $rootScope.token
  };
// Fails: dbGetSome params Object {userfilter: "", listfilter: ""} 

  console.log('dbGetSome params',params);

  $http({
      method: 'POST',
      url: apiPath + 'getSome',
      data: $.param(params),
      headers: {'Content-Type':'application/x-www-form-urlencoded'}
    })
    .success(function(data,status,headers,config){
      // console.log('dbFactory.getActivity data: ',data);
      if(thescope === 'root'){
        $rootScope.bite = data.results;
      } else {
        $rootScope.modal.bite = data.results;
      }
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
  if( window.location.search.replace("?", "") ){
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
  .success(function(data,status,headers,config){
      // Initialize the rootScope.
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
	$rootScope.vars = {};
	$rootScope.vars.listMenu = 'expanded';
	$rootScope.vars.user = { userId: 0};
	$rootScope.vars.message = '';
	$rootScope.vars.modal = { 
		show: false, type: null, user:{}, thing:{}, list:{}, header: null,
		filter: 'all'
	};
	$rootScope.vars.temp = {};
	$rootScope.listStore = [];
	$rootScope.friendStore = [];

	// 8/26/2014 New Navigation Vars
	$rootScope.nav = {
		filter: 'all',
		filterThing: null,
		sortLists: null,
		sortFriends: null,
		sortThings: null,
		modal: false,
		listCollapse: false,
		friendsCollapse: 'large',
		thingCollapse: false,
		context: null,
		sharedFilter: 'all',
		base: 'getSome'
	};

	$rootScope.session = {
		fbAuth: null,
		fbState: 'disconnected',
		plittoState: null
	};
      
    // Handle the users, lists and things.
      
      

    $rootScope.session.plittoState = 'Plitto Response Confirmed. Interface Loading.';
      // Get their friends
    if( typeof parseInt(data.me.puid) ==='number'){
      // User can log in
      // Initialize the scope settings.

      $rootScope.vars.user = { userId: data.me.puid, username: data.me.username, fbuid: data.me.fbuid };  // The API determines the value of this.
    
        // Set up the token
        $rootScope.token = data.me.token;
        console.log('the token: ',$rootScope.token);
        
      // Initial View: theactivity
      // $rootScope.nav.base = 'getSome';

      // $rootScope.nav.base = 'thefriends';
      // activeTab('getSome');
      // console.log('params', params);
      // console.log('rs 47', $rootScope);

      // TODO2 - Is there an easier way of doing this rathe than two Facebook API calls?
      // Check for localhost
        
      // TODO - do we need this? fbPlittoFriends('prod');
      

      /* load some content from "getSome" */
      // dbGetSome('root', null, null);

      //fLoad($rootScope.vars.user.userId, 'all','none',0,0,'newest');
        
        // Populate the initial "Ditto Some" view
        $rootScope.bite = data.getSome;
        console.log('get some goes into $rootScope.bite',$rootScope.bite);
        
    } else {
      // TODO2 - Present errors somewhere.
      // console.log("plittoLogin had some problems | data: ",data);

  $rootScope.session.plittoState = 'Plitto Login had Errors: ' + JSON.stringify(data);
    }

    // Update the window sizes
    // gotResized();

  });
};


/* Refactor to have a minimal $rootScope 9/3/2014 
  9/12/2014 - Updated to include 'theactivity'
*/
var activeTab = function(activeTab){
  // console.log('dbfactory active tabL ',activeTab);
  // Add the content for each section
  if(activeTab === 'thefriends'){

    $rootScope.friendStore = localStorageService.get('friendStore');
    if($rootScope.friendStore === null){
      // Make the friends call only if it is needed
      fbPlittoFriends('test');
    }
  }
  else if(activeTab === 'thelists'){
    listOfLists('all');

  }
  else if (activeTab === 'theactivity'){
    
    getActivity('all');
  }
}


/* Gets their Plitto Friends, and adds it to the local store. 9/3/2014
    // 10/21/2014 This will only be called on a refresh, which isn't built yet.
*/
var fbPlittoFriends = function (server){
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
var plittoFBApiCall = function (friendsData){
  // FriendsData could be null. What happens then?

  // Load from local storage, if it's there, then update it.
  $rootScope.friendStore = localStorageService.get('friendStore');

  // Only request their friends if they have more than 0.
  if(friendsData.length > 0){

  var params = $.param( { fbFriends: friendsData } );
      $http(
        {
          method:'POST',
          url:'api/pFriends', 
          data: params,
          headers: {'Content-Type':'application/x-www-form-urlencoded'}
      })
      .success(function(data,status,headers,config){
          // Handle the users, lists and things.
          // Add it to the scope, so it can be shown
          $rootScope.friendStore = data.result;

          // Update the local storage.
          localStorageAppend('friendStore',data.result);

        });
  } else {
    var response = 'You should invite your friends to Plitto';
    // console.log('response',response);
  }
};


// Appends content to the local storage
var localStorageAppend = function (type,data){
  if(type==='friendStore'){
    // TODO2 - Should this be overwritten, or appended to?
    localStorageService.set('friendStore',data);
  }
}


/* 9/3/2014 - Change the icon for this item. Also change the listStore 
  9/17/2013 - Updated to handle the new context, where there is just one template. Views to affect: 
    - LatestActivity:
    -  
*/
var updateMyKey  = function (action, listid, thingid, mykey, listname, thingname, friendsWith, ownerid){
  console.log('updateMyKey: ACTION',action, ' LISTID: ',listid, ' THINGID: ',thingid, ' MYKEY: ',mykey, ' LISTNAME: ',listname, ' THINGNAME: ', thingname, ' FRIENDSWITH: ',friendsWith, ' OWNERID: ',ownerid);
    if(action ==='pending'){
      action ='pending';
      mykey = 0;
      var newKey = 0;
    }else if(action !== 'ditto'){
      action = 'remove';
      var newKey = -1;
    } else {
      var newKey = 1;
    }

// console.log('updatemykey!!!');
if($rootScope.nav.modal === false){
  // This is from the activity Feed. Do none of the below.
  if($rootScope.nav.base === 'getSome'){
    console.log('update key. Bite.');
    for(i in $rootScope.bite){

      if(ownerid === $rootScope.bite[i].uid){
        for(j in $rootScope.bite[i].lists){
          if(listid === $rootScope.bite[i].lists[j].lid){
            for(k in $rootScope.bite[i].lists[j].items){
              if(thingid === $rootScope.bite[i].lists[j].items[k].tid){
                // console.log('found thing in list activityStore!');
                $rootScope.bite[i].lists[j].items[k].mykey = newKey;
              }
            }
          }  
        }
        
      }
    }
  }else {
    for(i in $rootScope.activityStore){

      if(ownerid === $rootScope.activityStore[i].uid){
        for(j in $rootScope.activityStore[i].lists){
          if(listid === $rootScope.activityStore[i].lists[j].lid){
            for(k in $rootScope.activityStore[i].lists[j].items){
              if(thingid === $rootScope.activityStore[i].lists[j].items[k].tid){
                // console.log('found thing in list activityStore!');
                $rootScope.activityStore[i].lists[j].items[k].mykey = newKey;
              }
            }
          }  
        }
        
      }
    }
  }

} else {
  // This will be within the modal window.
  for(i in $rootScope.modal.listStore){

    if(ownerid === $rootScope.modal.listStore[i].uid){
      for(j in $rootScope.modal.listStore[i].lists){
        if(listid === $rootScope.modal.listStore[i].lists[j].lid){
          for(k in $rootScope.modal.listStore[i].lists[j].items){
            if(thingid === $rootScope.modal.listStore[i].lists[j].items[k].tid){
              // console.log('found thing in list! modal.listStore');
              $rootScope.modal.listStore[i].lists[j].items[k].mykey = newKey;
            }
          }
        }  
      }
      
    }
  }

}

  


};



var showUserLists = function (friendId){
  // console.log('showUserLists', friendId);
  // Populate that user's information: from local storage?
  var userLists = localStorageService.get('userL_'+friendId);

  // See if we need to create the list store.
  if(!$rootScope.modal.listStore || $rootScope.modal.listStore.length === 0){
    $rootScope.modal.listStore = [];

  }

  // This is called by the "showUser" function in the nav.
  // Step 1: show just this user's lists.
   // console.log('showUserLists',friendId, $rootScope.modal.listStore);
  var existing = [];

  // Update the list store if we already have lists for this uer.
  if(userLists !== null){
    console.log("The userLists existed in the local storage");
    // Update the scope so their lists can be seen.
    $rootScope.modal.listStore = userLists;

    // console.log('rs ls',$rootScope.modal.listStore);

    // Build the filters for get more.
    // Root is user. Child is lists.
    for(i in $rootScope.modal.listStore){
      // For each list for this user: 
      for(k in $rootScope.modal.listStore[i].lists){
        // For each item in each list.
        for(j in $rootScope.modal.listStore[i].lists[k].items){
          // console.log('existing: ',$rootScope.listStore[i].listname, ' ', $rootScope.listStore[i].items[j].thingname);
          // $rootScope.modal.listStore[i].lists[k].items[j].show="1";
          // to filter stuff for GetMore
          existing.push({ 
              ult: friendId + '|' 
                + $rootScope.modal.listStore[i].lists[k].lid + '|' 
                + $rootScope.modal.listStore[i].lists[k].items[j].tid
            });
        }
      }
    } 
    
  } else {
    // console.log("User not found in local storage. Why? ", 'userL_' + friendId);
  }

  console.log("Existing in showUserLists:",existing);

  // Step 1.1 - Get their list of lists
  var userListOfLists = localStorageService.get('userLL_' + friendId);
  if(userListOfLists !== null){
    $rootScope.modal.listOfLists = userListOfLists;
  }

  // Only request to get more if there are less than 500 items.
  // console.log('existing length: ',existing.length);
  if(existing.length < 300){
  // Step 2: Load more for this user.
     var getMoreParams = $.param({
        type: 'user',
        id: friendId ,
        existing: existing      
      });

     // console.log('dbfactory.showUserLists | existing: ',existing);
     getMore (getMoreParams,friendId);
   } else {
    console.log('TODO1 - Handle this. Nothing is added here because we think we already have enough stuff.');
   }

  // Step 2.1: Update their list of lists
  getUserListOfLists(friendId);


};



/* 9/7/2014
  Get the list of lists for this user
*/
var getUserListOfLists = function(friendId){
  var params = $.param({users:friendId});
  // console.log('listoflists params: ',params);
  $http({
        method:'POST',
        url:'api/listOfLists', 
        data: params,
        headers: {'Content-Type':'application/x-www-form-urlencoded'}
    })
    .success(function(data,status,headers,config){
      // console.log("testlogin: ",data, data.puid);
      // Handle the users, lists and things.
        // Update the rootScope.
        $rootScope.modal.listOfLists = data.result;

        // Add / Update to local storage
        localStorageService.set('userLL_'+friendId, data.result);
      });
};


/* 9/7/2014
   Find shared if we don't know it.
*/
var sharedStat = function(friendId){
  // console.log('dbFactory.sharedState',friendId,$rootScope.friendStore);
  var friendStore = localStorageService.get('friendStore');
  //This will be in local storage, and in the friendStore.
  for(i in friendStore){
    // console.log('sharedStat loop');
    if(parseInt(friendStore[i].id) === parseInt(friendId)){
      $rootScope.vars.modal.user.shared = friendStore[i].shared;
      $rootScope.vars.modal.user.dittoable = friendStore[i].dittoable;
      // console.log('found 32',$rootScope.vars.modal.user.shared , friendStore[i].shared);
      {break}
    }
  }
}
// Add to a list.
var addToList = function(addToListObj){
  var addToListParams = $.param({thingName: addToListObj.name,
      listnameid: addToListObj.listnameid } );
  // console.log('dbFactory.addToList | ',addToListParams);
   $http(
      {
        method:'POST',
        url:'api/addToList', 
        data: addToListParams ,
        headers: {'Content-Type':'application/x-www-form-urlencoded'}
    })
    .success(function(data,status,headers,config){
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
    
console.log('rs',$rootScope.modal.listStore);

    for(i in $rootScope.modal.listStore){
      if($rootScope.modal.listStore[i].uid === $rootScope.vars.user.userId){
        myListPosition = i;
        for(j in $rootScope.modal.listStore[i].lists[0].items){
          if($rootScope.modal.listStore[i].lists[0].items[j].tid === item.thingid){
            myThingAlready = j;
          }
        }
      }
    }



    // console.log('didList',didList, 'myListPosition', myListPosition, 'myThingAlready', myThingAlready);

    // This section will make my list and make it first in the order.
    if(myListPosition === -1){
      // Make my list.
      var myList = {
        uid: $rootScope.vars.user.userId,
        fbuid: $rootScope.vars.user.fbuid,
        username: $rootScope.vars.user.username,
        lists: [ { items: [] } ]
      };
      // Make my list first
      $rootScope.modal.listStore.unshift(myList);

    } 
    else {
      // Make my list first
      if(myListPosition !== 0){
        var myList = $rootScope.modal.listStore[myListPosition];

        $rootScope.modal.listStore.splice(myListPosition, 1);
        $rootScope.modal.listStore.unshift(myList);
      } 
      // Add my item to my list at the top.

    }

    // Add my item to my list, but only if it's not already there.
    // TODO2 - Highlight an item that is already there.
    if(myThingAlready === -1){
      // console.log($rootScope.modal.listStore[0]);

      console.log($rootScope.modal.listStore);
      $rootScope.modal.listStore[0].lists[0].items.unshift(myNewItem);
    } else {
      // Move my old item to the top of your list.
      console.log('move it from one place to first',myThingAlready);
      $rootScope.modal.listStore[0].lists[0].items.splice(myThingAlready, 1);
      $rootScope.modal.listStore[0].lists[0].items.unshift(myNewItem);
    }

    // console.log('why are lists hiding after this?',$rootScope.vars,$rootScope.nav);
    /* End the Success Function */
  });

  

};


var modalReset = function(){
  // console.log("dbFactory.modalReset");
  // STEP 1 - Clear out any listStore filters applied within this user profile.
  for(i in $rootScope.listStore){
    // Check each list to see if it's mine. Hide it if it's mine.
    if(parseInt($rootScope.listStore[i].uid) === $rootScope.vars.user.userId){
      $rootScope.listStore[i].show = "0";
      
    } else {
      
      // Only go through the items if it's someone else's list.
      $rootScope.listStore[i].show = "1";
      for(j in $rootScope.listStore[i].items){
        $rootScope.listStore[i].items[j].show = "1"; 
        // console.log('Show'+ $rootScope.listStore[i].username + "'s " + $rootScope.listStore[i].listname + ' item' + $rootScope.listStore[i][j]) 
      }
    }
  }
};


/* 9/3/2014 */
var showAList = function(listnameid, listname, ownerid){
  // console.log('showAList: ',listnameid, ownerid);
    // user clicked on a list. Show all the items in that list without filtering. 
  $rootScope.nav.filterLists = null;

  // Prep the Modal:
  $rootScope.modal.header = listname;
  $rootScope.modal.type = 'list';


  listnameid = String(listnameid);

  // console.log('showaList: This: ',listnameid, ownerid);
  var showLists = 0;
  var goShow = null;
  

  var ownerListPosition = -1;

  // See if this list exists in the local storage
  var list = localStorageService.get('listL_'+ listnameid);
  // console.log('showalist local storage', list, listnameid);
  // Make this the modal's content.
  if(list !== null){

    // $rootScope.modal.listStore = list;
    $rootScope.modal.listStore = list;

    // Get the existing elements, so we can filter them out. 
    // console.log('showlist. This list exists in local storage');
 
  } else {
    // We'll build the basics of the list.
    list = [];
    $rootScope.modal.listStore = [];
  }
  
  if(list.length < 300){
    // build the existing items as a filter
    var existing = [];
    for(j in list){
      // console.log('list j',list[j]);
      for(l in list[j].lists[0].items)
      // This builds a filter for the GetMore part.
        existing.push({ 
            ult: list[j].uid + '|' 
              + listnameid + '|' 
              + list[j].lists[0].items[l].tid
          });
    
    }

      // Make the request to the api to load more for this list.
      var getMoreParams = $.param({
        type: 'list',
        id: listnameid ,
        uid: ownerid,
        existing: existing      
      });

      // console.log('existing list params: ',existing,' getmoreparams: ',getMoreParams);

     getMore (getMoreParams, listnameid);
   }
  // console.log('rs modal',$rootScope.vars.modal.filter);
};  


/* 9/3/2014 / 9.5.2014
  This function gets more content for a user or a list.
 */
var getMore = function (params , id) {
  // 
  // 
  console.log('getMoreparams: ',params);
  $http(
    {
      method:'POST',
      url:'api/getMore', 
      data: params ,
      headers: {'Content-Type':'application/x-www-form-urlencoded'}
  })
  .success(function(data,status,headers,config){
    // Append the data to the proper place.
    // console.log('data.results size',data.results,data.results.length);

    getMoreAppend('getMoreAppendSuccess',params,data.results, id);

    // Put it in the listStore if we know what it is
    
  });
};


/* 9/6/2014 - 
  Get more must append the results, not just overwrite them 
  9/17/2014 - Building it to append. 
*/
var getMoreAppend = function(caption,params,data, id) {
  // Step 1. Get the key that should be in place for the local storage.
  if($rootScope.nav.modal === true && $rootScope.nav.filter === "user"){
    var thefilter = 'modalUser';
    var thekey = 'userL_' + $rootScope.nav.filterId;
    gma = localStorageService.get(thekey);
    if(gma && gma.length > 0){
      $rootScope.modal.listStore = gma;
    } else {
      gma = [];
    }
  

  } 
  else if ($rootScope.nav.modal === true && $rootScope.nav.filter ==="list"){
    var thefilter = 'modalList';
    var thekey = 'listL_' + $rootScope.nav.filterId;
    console.log('list local storage key: ' , thekey, data);

    // Existing
    var existingList = localStorageService.get(thekey);
    if(existingList){
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
  if($rootScope.nav.modal === true){
    if(!$rootScope.modal.listStore || $rootScope.modal.listStore.length === 0){
      // It was empty, so make it this data.
      $rootScope.modal.listStore = data;
      console.log("Don't append because the liststore is false, or it's 0.", !$rootScope.modal.listStore,$rootScope.modal.listStore.length);
      shouldAppend = false;


      // Update the local storage.
      // var localKey = $rootScope.nav.filter + 'L_' + $rootScope.nav.filterid;
      if(thekey){
        console.log("SET THE KEY",thekey);
         localStorageService.set(thekey,data);
      }   

    } else {
      gma = $rootScope.modal.listStore;
    }
  }  else {
    if($rootScope.activityStore.length === 0){
      console.log("Don't append because the activity store is empty.");
      shouldAppend = false;
      $rootScope.activityStore = data;
    } else {
      gma = $rootScope.activityStore;
    }
  }
  // console.log('gma rootscope',' shouldAppend: ',shouldAppend);

  if(shouldAppend=== true){
    // console.log('move to append','gma: ',gma);

    // Look at the existing content to seed matches.
    var userLists = [];
    for(i in gma){
      for(j in gma[i].lists){
        userLists.push( { i: i, j: j, uid: gma[i].uid, lid: gma[i].lists[j].lid , used: false } );
      }
    }

    // console.log('userLists:',userLists);
    // PROBLEM - One list is being added four times rather than being appended to an existing list once..

    for(i in data){
      // Inside the user loop.
      for(j in data[i].lists){
        // Inside the list loop

        // Check existing for matches.
        for(z in userLists){
          //console.log('append',parseInt(userLists[z].uid) , parseInt(data[i].uid) , parseInt(userLists[z].lid) , parseInt(data[i].lists[j].lid) );
          if(userLists[z].uid === data[i].uid 
              && userLists[z].lid === data[i].lists[j].lid ){
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
        for(k in data[i].items[j]){

        } */
      }
    }

    // Process lists that are new. Anything with .used === false hasn't been added yet.
    console.log('unused items? userlists, data: ',userLists, data);
    // Data that is false can just be added, methinks.

    if(thefilter==='modalUser'){
      for(i in data[0].lists){
        // Push each list onto the scope if it wasn't already used..
        if(data[0].lists[i].used === false){
          gma[0].lists.push(data[0].lists[i]);
        }
        
      }
    } else if (thefilter === 'modalList'){
      console.log('userLists,data',userLists,data);
      for(i in data){
        // Inside the User part.
        console.log('dataused',data[i].lists[0].used);
        if(data[i].lists[0].used === false){
          // We have content for a user, but didn't append it before. Create this list for the user.
          gma.push(data[i]);
        }
      }
    }

/*

    for(i in data){
      for(j in data[i].lists){
        if(!data[i].lists[j].used){
          console.log('We have found an unprocessed list',data[i]);
          // Push the new list to the gma.
          gma.push(data[i]);
        }
      }
    }
*/
    // Update the proper scope.
    if(thefilter === 'modalUser' || thefilter==='modalList'){
      $rootScope.modal.listStore = gma;
      // Update the localStorage.
      localStorageService.set(thekey,gma);
    }


  }


  
  // Update the local storage.


  // 
  console.log('get more - post $rootScope.modal.listStore',$rootScope.modal.listStore);
  // console.log('ending GMA',gma);
}


var newList = function (thingName) {
  // Query the API and make the thing, if it needs to be made.
  var thingParams = $.param({thingName: thingName });
        $http({method:'POST',url:'api/thingid',data: thingParams,
          headers: {'Content-Type':'application/x-www-form-urlencoded'}})
        .success(function(data,status,headers,config){
          // 
          var newListId = data.results[0]['thingid'];
          // Call the showAList function.

          $rootScope.vars.modal.list = {
            listname: thingName,
            id: newListId
          };

          $rootScope.vars.modal.header = 'List: ' + thingName;

          $rootScope.vars.modal.type='list';
          $rootScope.nav.filter ='list';
          $rootScope.nav.modal = true;

          // This logic loads this list, and should show it in a new modal.
          showAList(newListId,null);


      });

};

return {
  plittoLogin: plittoLogin
  , activeTab: activeTab
  ,fbPlittoFriends: fbPlittoFriends
  , plittoFBApiCall: plittoFBApiCall
  , dbGetSome: dbGetSome
  , dbDitto: dbDitto
  , updateMyKey: updateMyKey
  , showUserLists: showUserLists
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
};
  
}]);