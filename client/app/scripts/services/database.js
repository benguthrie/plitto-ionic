'use strict';
angular.module('Services.database', [])

// This will handle storage within local databases.
.factory ('dbFactory', ['$http','$rootScope','localStorageService'
  , function ($http, $rootScope, localStorageService) {
      
// var apiPath = 'http://plitto.com/api/2.0/';
  // var apiPath = 'http://localhost/api/2.0/';
    var apiPath = '/api/2.0/';
      
/* 10/22/2014 */


var showFeed = function(theType, userFilter, listFilter, myState, oldestKey) {
  var params = $.param({theType: theType, userFilter: userFilter, listFilter: listFilter, myState: myState, oldestKey: oldestKey, token: $rootScope.token });
  
  // Is there currently a reed?
  console.log('showFeed params: ',params);
  
  $http(
  {
    method:'POST',
    url: apiPath + 'showFeed', 
    data: params ,
    headers: {'Content-Type':'application/x-www-form-urlencoded'}
  })
  .success(function(data,status,headers,config){
    
    if(theType === 'profile'){
      $rootScope.profileData.feed = data.results;
    }
    

    console.log("profile feed after showfeed",$rootScope.profileData.feed);
      // For the user and the list, change the increments of dittoable and in common.
  } );
  
}    
    
    
var showUser = function(userId){
  /*
  $root.showUser = {
      userName: userName,
      userId: userId,
      lists: [],
      ditto: [],
      feed: []
    };
    */
  
  // $rootScope.profileData = { lists: [], feed: [], ditto: [], milestones: []};
  
  $rootScope.profileData.lists = [{"id":"152275","name":"I like","lid":"6246","listmembers":"263","mymembers":"263","dittoable":"0","shared":"263","mostrecent":"2014-09-10 17:47:38","fbuids":"532345366"},{"id":"150331","name":"Movies I have Seen","lid":"231","listmembers":"261","mymembers":"261","dittoable":"0","shared":"261","mostrecent":"2014-09-18 14:57:33","fbuids":"532345366"},{"id":"150233","name":"Bands I have seen live","lid":"66","listmembers":"84","mymembers":"84","dittoable":"0","shared":"84","mostrecent":"2014-09-23 09:01:49","fbuids":"532345366"},{"id":"151021","name":"Cities I have visited on personal travels","lid":"1795","listmembers":"74","mymembers":"74","dittoable":"0","shared":"74","mostrecent":"2014-10-01 15:50:51","fbuids":"532345366"},{"id":"150243","name":"Cities Traveled for Work","lid":"85","listmembers":"63","mymembers":"63","dittoable":"0","shared":"63","mostrecent":"2011-10-06 01:01:42","fbuids":"532345366"},{"id":"151594","name":"Things Other People Like That I Don't","lid":"2911","listmembers":"56","mymembers":"56","dittoable":"0","shared":"56","mostrecent":"2014-09-22 05:49:56","fbuids":"532345366"},{"id":"150766","name":"Search Parameters for Houses","lid":"1357","listmembers":"54","mymembers":"54","dittoable":"0","shared":"54","mostrecent":"2008-11-22 22:54:15","fbuids":"532345366"},{"id":"151434","name":"Things I have Seen","lid":"2748","listmembers":"54","mymembers":"54","dittoable":"0","shared":"54","mostrecent":"2014-09-15 12:23:37","fbuids":"532345366"},{"id":"150366","name":"Yummy Things","lid":"134","listmembers":"50","mymembers":"50","dittoable":"0","shared":"50","mostrecent":"2014-09-04 07:03:07","fbuids":"532345366"},{"id":"152026","name":"about me","lid":"2250","listmembers":"48","mymembers":"48","dittoable":"0","shared":"48","mostrecent":"2011-08-28 03:09:54","fbuids":"532345366"},{"id":"151003","name":"Words Joseph Says","lid":"1724","listmembers":"42","mymembers":"42","dittoable":"0","shared":"42","mostrecent":"2014-10-01 15:37:11","fbuids":"532345366"},{"id":"151492","name":"Tech Services I Use","lid":"3063","listmembers":"41","mymembers":"41","dittoable":"0","shared":"41","mostrecent":"2014-10-02 15:45:30","fbuids":"532345366"},{"id":"152063","name":"States I've been to","lid":"5377","listmembers":"41","mymembers":"41","dittoable":"0","shared":"41","mostrecent":"2014-08-29 18:06:50","fbuids":"532345366"},{"id":"150344","name":"DVD Collection","lid":"260","listmembers":"35","mymembers":"35","dittoable":"0","shared":"35","mostrecent":"2009-08-17 02:16:34","fbuids":"532345366"},{"id":"151697","name":"Athletes I Like","lid":"2921","listmembers":"35","mymembers":"35","dittoable":"0","shared":"35","mostrecent":"2014-10-21 14:29:06","fbuids":"532345366"},{"id":"150429","name":"Recreational Hobbies","lid":"534","listmembers":"33","mymembers":"33","dittoable":"0","shared":"33","mostrecent":"2014-09-06 10:27:11","fbuids":"532345366"},{"id":"150813","name":"Rip these off","lid":"1409","listmembers":"33","mymembers":"33","dittoable":"0","shared":"33","mostrecent":"2008-11-22 22:54:15","fbuids":"532345366"},{"id":"151263","name":"Scrabble Bingos","lid":"2234","listmembers":"33","mymembers":"33","dittoable":"0","shared":"33","mostrecent":"2008-11-22 22:54:15","fbuids":"532345366"},{"id":"151465","name":"Simple Pleasures","lid":"2851","listmembers":"33","mymembers":"33","dittoable":"0","shared":"33","mostrecent":"2014-10-20 14:06:47","fbuids":"532345366"},{"id":"150845","name":"Wishlist","lid":"400","listmembers":"32","mymembers":"32","dittoable":"0","shared":"32","mostrecent":"2009-08-19 01:57:49","fbuids":"532345366"}];

  
  getSome('profile',userId,'');
  /*
  $rootScope.profileData.ditto = [{"uid":"18","username":"Greg Guthrie","fbuid":"4700900","lists":[{"lid":"2851","listname":"Simple Pleasures","items":[{"added":"2008-11-22 22:54:15","tid":"2932","thingname":"Making a child laugh","mykey":null,"dittokey":"0","dittouser":null,"dittofbuid":null,"dittousername":null},{"added":"2008-11-22 22:54:15","tid":"4358","thingname":"blowing a smoke ring","mykey":null,"dittokey":"0","dittouser":null,"dittofbuid":null,"dittousername":null},{"added":"2008-11-22 22:54:15","tid":"2854","thingname":"Seeing someone who's late for class run with their backpack on","mykey":null,"dittokey":"0","dittouser":null,"dittofbuid":null,"dittousername":null},{"added":"2009-06-24 03:51:38","tid":"6745","thingname":"Catching someone stumble, catch themselves, and try to play it cool","mykey":null,"dittokey":"0","dittouser":null,"dittofbuid":null,"dittousername":null},{"added":"2008-11-22 22:54:15","tid":"3302","thingname":"Emptying a really full bladder","mykey":null,"dittokey":"0","dittouser":null,"dittofbuid":null,"dittousername":null},{"added":"2008-11-23 20:33:46","tid":"4361","thingname":"having an itch successfully scratched","mykey":null,"dittokey":"0","dittouser":null,"dittofbuid":null,"dittousername":null},{"added":"2008-11-22 22:54:15","tid":"2856","thingname":"Throwing something at the garbage can and having it go in","mykey":null,"dittokey":"0","dittouser":null,"dittofbuid":null,"dittousername":null},{"added":"2008-11-22 22:54:15","tid":"3310","thingname":"Catching things you drop before they hit the ground","mykey":null,"dittokey":"0","dittouser":null,"dittofbuid":null,"dittousername":null},{"added":"2008-11-22 22:54:15","tid":"3141","thingname":"Naps on a rainy day","mykey":null,"dittokey":"0","dittouser":null,"dittofbuid":null,"dittousername":null},{"added":"2009-06-24 03:57:19","tid":"6749","thingname":"Seeing someone obliviously rocking out in their car","mykey":null,"dittokey":"0","dittouser":null,"dittofbuid":null,"dittousername":null}]}]},{"uid":"2","username":"Emily Muscarella Guthrie","fbuid":"605592731","lists":[{"lid":"1251","listname":"Books I Have Read","items":[{"added":"2008-11-22 22:54:15","tid":"2405","thingname":"Catcher in the Rye","mykey":null,"dittokey":"0","dittouser":null,"dittofbuid":null,"dittousername":null},{"added":"2008-11-22 22:54:15","tid":"1590","thingname":"Julie and Julia","mykey":null,"dittokey":"0","dittouser":null,"dittofbuid":null,"dittousername":null},{"added":"2008-11-22 22:54:15","tid":"2399","thingname":"My Life in France","mykey":null,"dittokey":"0","dittouser":null,"dittofbuid":null,"dittousername":null},{"added":"2008-11-22 22:54:15","tid":"2400","thingname":"Breathe","mykey":null,"dittokey":"0","dittouser":null,"dittofbuid":null,"dittousername":null},{"added":"2008-11-22 22:54:15","tid":"2401","thingname":"The Graduate","mykey":null,"dittokey":"0","dittouser":null,"dittofbuid":null,"dittousername":null}]}]},{"uid":"0","username":"","fbuid":"0","lists":[{"lid":"484","listname":"Beastie Boys","items":[{"added":"2011-07-30 04:02:42","tid":"7756","thingname":"Hello, Nasty","mykey":null,"dittokey":"0","dittouser":null,"dittofbuid":null,"dittousername":null},{"added":"2011-07-30 04:01:50","tid":"7752","thingname":"Ill Communication","mykey":null,"dittokey":"0","dittouser":null,"dittofbuid":null,"dittousername":null},{"added":"2011-07-30 04:02:51","tid":"7757","thingname":"Licensed To Ill","mykey":null,"dittokey":"0","dittouser":null,"dittofbuid":null,"dittousername":null},{"added":"2011-07-30 04:02:21","tid":"7753","thingname":"Hot Sauce Committee Part Two","mykey":null,"dittokey":"0","dittouser":null,"dittofbuid":null,"dittousername":null},{"added":"2014-10-01 17:46:37","tid":"7753","thingname":"Hot Sauce Committee Part Two","mykey":null,"dittokey":"1746","dittouser":null,"dittofbuid":null,"dittousername":null},{"added":"2011-07-30 04:02:27","tid":"7754","thingname":"Check Yer Head","mykey":null,"dittokey":"0","dittouser":null,"dittofbuid":null,"dittousername":null},{"added":"2014-10-01 17:46:44","tid":"7752","thingname":"Ill Communication","mykey":null,"dittokey":"1707","dittouser":null,"dittofbuid":null,"dittousername":null},{"added":"2011-07-30 04:02:36","tid":"7755","thingname":"Paul's Boutique","mykey":null,"dittokey":"0","dittouser":null,"dittofbuid":null,"dittousername":null}]}]}];*/
  
  
                          
};
    
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

    
    
/* 9/4/2014 - 9/3/2014 - Handle the ditto action 
    10/21/2014 - Vastly improved this.
*/

// dbFactory.dbDitto('bite',i,j,k,mykey,uid,lid,tid);      
      
var dbDitto = function (scopeName, i,j,k, mykey, uid, lid, tid, event ){
  //  console.log('dbFactory.dbDitto | mykey: ', mykey,'| ownerid: ', uid, '| listid: ',lid, tid,i,j,k);

// Update the action, by whether or not the first item is null or not.
if(mykey === null){
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
  .success(function(data,status,headers,config){
    // console.log("ditto response: ",data,'mykey',data.results[0]['thekey']);

    if(action === 'ditto'){
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
    console.log('rs sn: ',scopeName, $rootScope[scopeName]);
      // $rootScope[scopeName][i].lists[j].items[k].mykey = mynewkey;
      eval('$rootScope.' + scopeName + '[i]["lists"][j]["items"][k].mykey = ' +mynewkey);
      
  });

};

/* Get Some - things to ditto 
  9/23/2014 - Created
*/
var dbGetSome = function(thescope, userfilter, listfilter){
  console.log('getSomeDB Scope: ',thescope,' userfilter: ',userfilter,' listfilter: ',listfilter);

  var params = {
    type:'user',
    userFilter: userfilter,
    listFilter: listfilter,
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
      /*
      if(thescope === 'root'){
        $rootScope.bite = data.results;
      } else {
        $rootScope.modal.bite = data.results;
      }*/
      if(thescope === 'profile'){
          $rootScope.profileData.ditto = data.results;
      } else {
        $rootScope.bite = data.results;
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
	$rootScope.vars = { };
	$rootScope.vars.listMenu = 'expanded';
	$rootScope.vars.user = { userId: 0};
	$rootScope.vars.message = '';
	
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
      
    // Handle the users, lists and things.
      
      

    $rootScope.session.plittoState = 'Plitto Response Confirmed. Interface Loading.';
      // Get their friends
    if( typeof parseInt(data.me.puid) ==='number'){
      // User can log in
      // Initialize the scope settings.

      $rootScope.vars.user = { userId: data.me.puid, username: data.me.username, fbuid: data.me.fbuid };  // The API determines the value of this.
    
        // Set up the token
        $rootScope.token = data.me.token;
        $rootScope.friendStore = data.friends;
        
        console.log('the token: ',$rootScope.token, 'friend store: ',$rootScope.friendStore);
        
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
          url: apiPath+'pFriends', 
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
    // TODO2 - load from local storage, if it's there 
    
  var params = $.param({userfilter:friendId, token: $rootScope.token });
  // console.log('listoflists params: ',params);
  $http({
        method:'POST',
        url: apiPath + 'listOfLists', 
        data: params,
        headers: {'Content-Type':'application/x-www-form-urlencoded'}
    })
    .success(function(data,status,headers,config){
      // console.log("testlogin: ",data, data.puid);
      // Handle the users, lists and things.
        // Update the rootScope lists.
      // TODO - Come up with a strategy of where to store this better than Rootscope. Also, for each user, when navigating around, this could change.
        $rootScope.lists = data.result;
    
    console.log('rootscope.lists', $rootScope.lists);

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
    
     
     
console.log('rs.list',$rootScope.list, $rootScope.list.items);
var i = 0, j=0;
    for(i in $rootScope.list.items){
      // console.log('652 - rs.list.items',$rootScope.list.items[i],i);
      if($rootScope.list.items[i].uid === $rootScope.vars.user.userId){
        myListPosition = i;
        // We can assume that is the the first list, since there can only be one showing.
        for(j in $rootScope.list.items[i].lists[0].items){
          if($rootScope.list.items[i].lists[0].items[j].tid === item.thingid){
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
      $rootScope.list.items.unshift(myList);

    } 
    else {
      // Make my list first
      if(myListPosition !== 0){
        var myList = $rootScope.list.items[myListPosition];

        $rootScope.list.items.splice(myListPosition, 1);
        $rootScope.list.items.unshift(myList);
      } 
      // Add my item to my list at the top.

    }

    // Add my item to my list, but only if it's not already there.
    // TODO2 - Highlight an item that is already there.
    if(myThingAlready === -1){
      // console.log($rootScope.modal.listStore[0]);

      console.log('RootStore before I build', $rootScope.list.items);
      $rootScope.list.items[0].lists[0].items.unshift(myNewItem);
    } else {
      // Move my old item to the top of your list.
      console.log('move it from one place to first',myThingAlready);
      $rootScope.list.items[0].lists[0].items.splice(myThingAlready, 1);
      $rootScope.list.items[0].lists[0].items.unshift(myNewItem);
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
var showAList = function(listNameId, listName, userFilter){
  // 
    console.log('showAList: ',listNameId, listName , userFilter);
  
  $rootScope.list = { listId: listNameId, listName: listName, myItems: null , dittoable: null, shared: null, items: [] };
  
  var existing = [];    
  getMore ('list',listNameId, userFilter, existing);

  
    // user clicked on a list. Show all the items in that list without filtering. 
    
/* TODO1 - Navigate to the proper list.
This was how Plitto Angular handled navigating to a list    
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
    existing: []
  });
*/
  // console.log('existing list params: ',existing,' getmoreparams: ',getMoreParams);

   
  // console.log('rs modal',$rootScope.vars.modal.filter);
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
  .success(function(data,status,headers,config){
    // Append the data to the proper place.
    // console.log('data.results size',data.results,data.results.length);

    // TODO1 - Add it to the correct store. getMoreAppend('getMoreAppendSuccess',params,data.results, id);

    // Put it in the listStore if we know what it is
    if(type==="list"){
      $rootScope.list.items = data.results;
      // $rootScope.list.itemCount = data.results.length;
      
      console.log("rootScope.list built by getMore: ",$rootScope.list.items);
      
    } else if(type==="user"){
      console.log("TODO1 - Build the place to store user information");
    }
    
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


var newList = function (thingName, success, failure) {
  // Query the API and make the thing, if it needs to be made.
  var thingParams = $.param({thingName: thingName });
        $http({
            method:'POST',
            url:apiPath + 'thingid',
            data: thingParams,
            headers: {'Content-Type':'application/x-www-form-urlencoded'}
        })
        .success(function(data,status,headers,config){
          // 
          var newListId = data.results[0]['thingid'];
            console.log("New List ID: ",newListId);
          
            success(newListId, thingName);
              
          // Callback - On creating the new list.
          
          
          // Call the showAList function.

// TODO1 - Where do we put this?             
            /* This was how plitto-angular handled navigation.
          $rootScope.vars.modal.list = {
            listname: thingName,
            id: newListId
          };

          $rootScope.vars.modal.header = 'List: ' + thingName;

          $rootScope.vars.modal.type='list';
          $rootScope.nav.filter ='list';
          $rootScope.nav.modal = true;
*/
          // This logic loads this list, and should show it in a new modal.
         //  showAList(newListId,thingName, null);
          
          /* TODO1 - Close the modal, navigate to the new list 
            Implement a callback to the controller?
            Needs to: 
              Navigate to the proper list, by id.
              Update the list store to include this new list?
              
          */
          
      });

};

return {
  plittoLogin: plittoLogin
  , activeTab: activeTab
  , fbPlittoFriends: fbPlittoFriends
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
  , showUser: showUser
  , showFeed: showFeed
};
  
}]);