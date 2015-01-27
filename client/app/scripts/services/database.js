'use strict';
angular.module('Services.database', ['LocalStorageModule'])

// This will handle storage within local databases.
.factory('dbFactory', ['$http', '$rootScope', '$state', 'localStorageService', function ($http, $rootScope, $state, localStorageService) {
  /* configure Constants */
  var apiPath = (window.cordova) ? 'http://plitto.com/api/2.0/' : '/api/2.0/';

  /* This is for when there are no records. */
  function zeroRecords() {
    return {
      'msg': 'No Records',
      'time': now()
    };
    // console.log('dbFactory.zerorecords zero records: ', now());
  }

  function logout() {
    console.log('logout');
    $rootScope.debug('Appctrl - TODO2: FB Logout call.');
    // $state.go('app.login',{listId: newListId});
    // TODO1 - Restore this. Facebook.logout();

    // Clear all the stores.
    dbInit();
    localStorageService.clearAll();
  }

  function checkLogout(data) {
    if (typeof data.logout !== 'undefined' && data.logout === '1') {
      return true;
    } else {
      return false;
    }
  }

  /* TODO2 1/16/2015 it looks like this can be removed. This custom data format is obsolete. 
  function processNotification ( theData , theUserId ) {
    // console.log('theUserId is not used. TODO2', theUserId);
    // console.log('this is the data: ', theData , theUserId );
    var notificationFeed = [];
    var makeRead = [];

    for (var i in theData){
      // console.log('entry: ', entry);
      var theType = theData[i].theType;
      // console.log('find type: ', theData.theType, theData[i].theType );
      delete theData[i].theType;
      notificationFeed.push({ type: theType, content:[ theData[i] ]  });

      // console.log("TD", theData[i].read, theData[i].toUserId, $rootScope.user.userId );
      if(theData[i].toUserId === $rootScope.user.userId && theData[i].read === '0' ){
        // console.log("Match!");
        makeRead.push( { id: theData[i].id, type: theType } );
      }
    }

    if(makeRead.length > 0){
      makeNotificationRead ( makeRead );
    }

    return notificationFeed;
  }
  */

  function makeNotificationRead(makeRead) {
    var params = $.param({
      token: $rootScope.token,
      makeRead: makeRead
    });

    // console.log("Notifications, makeRead: ", makeRead);

    $http({
        method: 'POST',
        url: apiPath + 'makeNotificationRead',
        data: params,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .success(function (data, status, headers, config) {

          if (checkLogout(data) === true) {
            logout();
          } else {
            // Do something?
            // 
            console.log('TODO2 use db line 50. Do something?', data, status, headers, config);

          }


        }
        // console.log("profile feed after showfeed",$rootScope.profileData.feed);
      );

  }

  /* Clean Scope. Keep the scope reasonably small. As tue user navigates around, clean the scope. 1/22/2015*/
  var cleanOtherScope = function (dontClean, source) {
    console.log('Clean the scope for everything other than ', dontClean, source);
    if (dontClean !== 'profile') {
      $rootScope.profileData = [];
    }
    if (dontClean !== 'friends') {
      $rootScope.friendStore = [];
    }
    if (dontClean !== 'list') {
      $rootScope.list = [];
    }
    if (dontClean !== 'chat') {
      $rootScope.stats.feed = [];
    }
    if (dontClean !== 'lists') {
      $rootScope.listsData = [];
    }
    if (dontClean !== 'feed') {
      $rootScope.feed = [];
    }
    if (dontClean !== 'bite') {
      $rootScope.bite = [];
    }



  };


  var promiseDitto = function (mykey, uid, lid, tid, itemKey, event) {
    //  console.log('dbFactory.dbDitto | mykey: ', mykey,'| ownerid: ', uid, '| listid: ',lid, tid,i,j,k);

    // Update the action, by whether or not the first item is null or not.
    var action = 'remove';
    if (mykey === null) {
      // My key is null, so this must be a ditto.
      // console.log('update action ditto', mykey, parseInt(mykey));
      action = 'ditto';
    }

    var dittoParams = $.param({
      action: action,
      itemKey: itemKey,
      token: $rootScope.token
    });

    var promise = $http({
        method: 'POST',
        url: apiPath + 'ditto',
        data: dittoParams,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function (response) {
        console.log('promise ditto. api response: ', response);

        if (checkLogout(response.data) === true) {
          logout();
        } else {
          // console.log('Ditto Response TODO2 Use shc', status, headers, config);
          var mynewkey = null;
          if (action === 'ditto') {

            mynewkey = response.data.results[0].thekey;
            var friendsWith = response.data.results[0].friendsWith;
          }
        }
        var pDittoArray = Array(mynewkey, friendsWith, action);
        // return pDittoArray;
        return pDittoArray;
      });

    return promise;

  };


  /* For the Friends Page. */
  var friendsList = function () {
    // console.log('!!!UpdateCounts');

    var params = $.param({
      token: $rootScope.token
    });

    $http({
        method: 'POST',
        url: apiPath + 'friendsList',
        data: params,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .success(function (data, status, headers, config) {

          if (checkLogout(data) === true) {
            logout();
          } else {
            // TODO3 - Error checking on the existance of these fields. 
            // console.log('updateCounts return: ', data, 'TODO2 use status, headers, config: ', status, headers, config );

            return data.results;

            // 
            localStorageService.set('friendStore', data.results);
            console.log('gotFriends');
          }


        }
        // console.log("profile feed after showfeed",$rootScope.profileData.feed);
      );

    // console.log("New Alert Count: ", $rootScope.stats.alerts.total);
  };

  /* TODO2 - Return this. Update to promise. 
  var updateCounts = function () {
    // console.log('!!!UpdateCounts');

    var params = $.param({
      token: $rootScope.token
    });

    $http({
      method: 'POST',
      url: apiPath + 'updateCounts',
      data: params,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    .success(function (data, status, headers, config) {
      
      if( checkLogout(data) === true ) {
        logout();
      } else {
        // TODO3 - Error checking on the existance of these fields. 
        // console.log('updateCounts return: ', data, 'TODO2 use status, headers, config: ', status, headers, config );

        $rootScope.stats.alertCount = data.results.notifications;
        $rootScope.stats.friends = data.results.friendCount;
        $rootScope.stats.lists = data.results.listCount;
        $rootScope.stats.things = data.results.thingCount;
        $rootScope.stats.unreadChats = data.results.unreadChats;
        $rootScope.stats.unreadDittos = data.results.unreadDittos;
        $rootScope.stats.feedCount = data.results.feedCount;
        $rootScope.stats.friendRequests = data.results.friendRequests;

      }
      

    }
    // console.log("profile feed after showfeed",$rootScope.profileData.feed);
    );

    // console.log("New Alert Count: ", $rootScope.stats.alerts.total);
  };
  */

  /* TODO2 - convert to promise and return this 
  var userChat = function ( userId ) {
    // userId of -1 is passed for all, wit hnewest for this user. 
    
    // Populate the notifications from an api call..
    var params = $.param({
      token: $rootScope.token,
      userFilter: userId
    });


    $http({
      method: 'POST',
      // url: apiPath + 'loadNotifications',
      url: apiPath + 'chatabout',
      data: params,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    .success(function (data) {
      
      if( checkLogout(data) === true ) {
        logout();
      } else {
        console.log('filter userid; ', userId);
        // console.log("Chat Data: ",data.results);
        // Do something?
        
        
        return data.results
          
        
        

        // console.log("Load Notifications", response.data.results);
        // $rootScope.notificationFeed = processNotification( data.results , userId );
        // console.log('nf',notificationFeed);
        // return notificationFeed;
        // console.log("49", response.data.results);
        // return processNotification( response.data.results , userId );

      }
      

    }
    // console.log("profile feed after showfeed",$rootScope.profileData.feed);
    );
    // console.log("The Promise: ", promise );
    

  };
  */



  /* 11/2/2014 */
  var checkToken = function (token) {
    // console.log('check the token to see if we should proceed.');
    if (typeof token === 'undefined' || token.length === 0) {
      // TODO1 - Conditition around this, if there is a token in the querystring. $state.go("login");
      dbInit();
    }

  };

  var promiseAddComment = function (uid, lid, tid, itemKey, newComment, status) {
    // console.log('dbFactory.addComment log: ', uid, lid, tid, itemKey, newComment, status);
    var params = $.param({
      token: $rootScope.token,
      uid: uid,
      lid: lid,
      tid: tid,
      itemKey: itemKey,
      comment: newComment,
      status: status
    });

    var promise = $http({
        method: 'POST',
        url: apiPath + 'addComment',
        data: params,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function (response) {

          if (checkLogout(response.data) === true) {
            logout();
          } else {
            return response.data;
            // Do something?
            console.log('New comment succeeded. Do something?',
              data,
              'TODO2 use status, headers, config: ',
              status,
              headers,
              config
            );

          }
        }
        // console.log("profile feed after showfeed",$rootScope.profileData.feed);
      );

    return promise;

  };


  var dbInit = function (fCallback) {

    // console.log('database.dbInit called. rootScope initialized! Mount up!');

    // Constants / For checking things.
    $rootScope.constants = {
      version: 1.00,
      lastBuild: '20141216'

    };

    // Last Login logging
    $rootScope.initTime = Math.round(new Date().getTime() / 1000);

    // These have been used and referenced since Nov 4.
    $rootScope.token = null;


    $rootScope.debugOn = false; // Debug
    $rootScope.loginMessage = ''; // Also debug, but that's in how you use it.
    $rootScope.nav = {
      listView: 'ditto',
      profileView: 'ditto',
      view: 'home', // This tracks the currently active view, and sub-view.
      homeView: 'friends',
      feedView: 'friends'
    };

    $rootScope.feed = {
      friends: [],
      strangers: []
    };

    $rootScope.list = {
      listId: null,
      listName: null,
      ditto: [],
      shared: [],
      mine: [],
      feed: []
    };

    $rootScope.listStore = [];
    $rootScope.friendStore = [];
    $rootScope.profileData = {
      lists: [], // It seems inefficient to have this be part of the profileData as the RootScope. Call it when it's needed? 
      userId: null,
      feed: [],
      ditto: [],
      shared: [], // TODO2: This could likely be removed
      chat: []
    };

    $rootScope.stats = {
      alertCount: null,
      dailyActity: null,
      friendRequests: null,
      alerts: {
        chats: null,
        dittos: null,
        milestones: null,
        introductions: null,
        total: null
      },
      chats: null,
      dittos: null,
      lists: null,
      things: null,
      friends: null,
      feedCount: null,

      milestones: null,
      introductions: null,
      total: null,
      feed: []
    };

    $rootScope.loginMessage = 'RS initialized.';


    if (typeof fCallback === 'function') {
      //console.log('fCallback in init made');
      fCallback('complete');
    }
  };

  /* 11/12/2014 - Created */
  var loadFeed = function (filter, startFrom) {
    console.log('TODO2 - use startfrom in loadFeed', startFrom);
    // Step 1: Load from local storage.
    $rootScope.feed.friends = localStorageService.get('feedFriends');
    $rootScope.feed.strangers = localStorageService.get('feedStrangers');
  };


  /* 11/12/2014 - Created 
    dbFactory.mainFeed(filter, continueFrom, filter, '', '','nav.feed.' + filter, newerOrOlder);
  */
  var mainFeed = function (theType, continueFrom, userFilter, listFilter, sharedFilter, scopeName, newerOrOlder) {

    // console.log('mainFeed:',theType, continueFrom);
    var continueKey = 0;

    // Step 0 - Prep by finding the oldest key
    if (continueFrom === 'older' && $rootScope.feed[theType].length > 0) {
      // The interface doesn't know the last key. Help it.
      var userCt = ($rootScope.feed[theType].length - 1);


      var listCt = $rootScope.feed[theType][userCt].lists.length - 1;
      if (typeof $rootScope.feed[theType][userCt].lists[listCt].items !== 'undefined') {
        var thingCt = $rootScope.feed[theType][userCt].lists[listCt].items.length - 1;
        if (typeof $rootScope.feed[theType][userCt].lists[listCt].items[thingCt].id !== 'undefined') {
          continueKey = $rootScope.feed[theType][userCt].lists[listCt].items[thingCt].id;
        }
      }
      // console.log('last? ',  continueFrom);
    }
    // TODO3 - Create a way to load newer content.

    // Step 1: Make the call the the API
    var params = $.param({
      theType: theType,
      userFilter: '',
      listFilter: '',
      myState: '',
      continueKey: continueKey,
      token: $rootScope.token,
      newerOrOlder: newerOrOlder
    });

    $http({
        method: 'POST',
        url: apiPath + 'showFeed',
        data: params,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .success(function (data, status, headers, config) {

          if (checkLogout(data) === true) {
            logout();
          } else {
            console.log('showFeed. TODO2 Use shc', status, headers, config, data);
            // console.log('continue: ',oldestKey);

            console.log('database.loadFeed - showFeed data: ', data);

            if (checkLogout(data) === true) {
              logout();
            } else {
              if (continueFrom === 'older' && continueKey !== 0) {
                // Append 
                // console.log('readL older');
                for (var rRow in data.results) {
                  $rootScope.feed[theType].push(data.results[rRow]);
                }
              } else {
                // Replace
                $rootScope.feed[theType] = data.results;
              }

            }
            // Update local storage TODO2
            // eval('localStorageService.set("feed'+ (theType && theType[0].toUpperCase() + theType.slice(1) ) + '", data.results)');

            // console.log('feed.Friends: ', $rootScope.feed.friends);
            // console.log('feed.Strangers: ', $rootScope.feed.strangers);

          }

        }
        // console.log("profile feed after showfeed",$rootScope.profileData.feed);
      ).error(function (data, status, headers, config) {
        console.log('database.showFeed error. ', data, status, headers, config);

      });
  };

  /* Function to return basic (public) information about a user based on their user id. */
  var userInfo = function (userId) {

    var params = $.param({
      uid: userId,
      token: $rootScope.token
    });



    $http({
        method: 'POST',
        url: apiPath + 'userInfo',
        data: params,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .success(function (data, status, headers, config) {
        return data;


        if (checkLogout(data) === true) {
          logout();
        } else {

          // console.log('TODO2 database.showfeed Use shc', data, status, headers, config);
          // Error Handling - TODO1 - Add error handling to all calls.
          if (typeof data.logout !== 'undefined') {
            console.log('API ERROR', data);
            if (data.logout === true) {
              console.log('showFeed.database: We should log out 364.');
              logout();
            }
          }

          // Set user info based on these results.
          // console.log('userInfo: ', userId, data);
          console.log('UserInformation!!! - return this: ', data.results);
          // return data;




        }

        // console.log("profile feed after showfeed",$rootScope.profileData.feed);
      })
      .error(function () {
        console.log('There was an error in database.showfeed/showFeed');
        return 'error';
      });
  };

  /* 10/22/2014 
    1/22/2015 - Added and made async. 
  */
  var promiseFeed = function (theType, userFilter, listFilter, myState, continueKey, newerOrOlder) {
    console.log('promise feed theType, userFilter, listFilter, myState, continueKey, newerOrOlder', theType, userFilter, listFilter, myState, continueKey, newerOrOlder);
    var params = $.param({
      theType: theType,
      userFilter: userFilter,
      listFilter: listFilter,
      myState: myState,
      continueKey: continueKey,
      newerOrOlder: newerOrOlder,
      token: $rootScope.token
    });



    var promise = $http({
        method: 'POST',
        url: apiPath + 'showFeed',
        data: params,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function (response) {
        if (checkLogout(response.data) === true) {
          logout();
        } else {
          // console.log('TODO2 database.showfeed Use shc', data, status, headers, config);
          // Error Handling - TODO1 - Add error handling to all calls.
          if (typeof response.data.logout !== 'undefined') {
            console.log('API ERROR', data);
            if (data.logout === true) {
              console.log('showFeed.database: We should log out 364.');
              logout();
            }
          }

          console.log('database.showFeed: ',
            ' type: ', theType,
            ' userFilter: ', userFilter,
            ' listFilter: ', listFilter,
            ' myState: ', myState,
            ' continueKey: ', continueKey,
            ' orOlder: ', newerOrOlder,
            ' data: ', response.data);
          return response.data.results;


          if (userFilter !== '0' && userFilter !== '') {
            // We know it's a user, so let's set local storage.
            localStorageService.set('user' + userFilter + 'feed', response.data.results);
          }

        }

        // console.log("profile feed after showfeed",$rootScope.profileData.feed);
      });
    return promise;


  };

  /* 10/22/2014 
    1/22/2015 - Updated. This will be called individually many more times via profileCtrl to speed up calls.
  */
  var showFeed = function (theType, userFilter, listFilter, myState, continueKey, newerOrOlder) {
    var params = $.param({
      theType: theType,
      userFilter: userFilter,
      listFilter: listFilter,
      myState: myState,
      continueKey: continueKey,
      newerOrOlder: newerOrOlder,
      token: $rootScope.token
    });

    // Load from local storage first.
    if (userFilter !== '0' && userFilter !== '' && localStorageService.get('user' + userFilter + 'feed')) {
      // We know it's a user, so let's set local storage.
      $rootScope.profileData.feed = localStorageService.get('user' + userFilter + 'feed');
    }

    $http({
        method: 'POST',
        url: apiPath + 'showFeed',
        data: params,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .success(function (data, status, headers, config) {
        if (checkLogout(data) === true) {
          logout();
        } else {
          // console.log('TODO2 database.showfeed Use shc', data, status, headers, config);
          // Error Handling - TODO1 - Add error handling to all calls.
          if (typeof data.logout !== 'undefined') {
            console.log('API ERROR', data);
            if (data.logout === true) {
              console.log('showFeed.database: We should log out 364.');
              logout();
            }
          }

          if (userFilter !== '0' && userFilter !== '') {
            // We know it's a user, so let's set local storage.
            localStorageService.set('user' + userFilter + 'feed', data.results);
          }
          console.log('database.showFeed: ',
            ' type: ', theType,
            ' userFilter: ', userFilter,
            ' listFilter: ', listFilter,
            ' myState: ', myState,
            ' continueKey: ', continueKey,
            ' orOlder: ', newerOrOlder,
            ' data: ', data);
          return data.results;

        }

        // console.log("profile feed after showfeed",$rootScope.profileData.feed);
      })
      .error(function () {
        console.log('There was an error in database.showfeed/showFeed');
      });
  };

  /* 11.3.2014 */
  var showUser = function (userId, userName, dataScope, fbuid) {
    cleanOtherScope('user', 'dbShowUser');

    // TODO2 - Handle this if it's a stranger. For now, quit.
    if (userId === 0 || userId === '0') {
      console.log('Linking to Strangers is not currently supported');
      return;
    }


    // Populate from local storage.
    var lsTypes = new Array('ditto', 'feed', 'lists', 'shared');
    /*
      for (var i in lsTypes){
        if(localStorageService.get('user' + userId + lsTypes[i])){
          // eval('$rootScope.profileData.' + lsTypes[i] + ' =localStorageService.get("user' + userId + '' + lsTypes[i] + '");');
          $rootScope.profileData[ lsTypes[i] ] =localStorageService.get('user' + userId + lsTypes[i] );

        }
      }
    */

    // Start by populating from local storage.

    // Get something to ditto 
    if ($rootScope.user.userId !== userId) {
      showFeed('profile', userId, 'listFilter', '', '');
      $rootScope.nav.view = 'user.feed'; // Default to our relationship stats. Was user.ditto
      // TODO2 -  dbGetSome('$rootScope.profileData.ditto', userId, '', 'ditto');
      // TODO2 - Restore the "us" view. Analytics, ftw? 

    } else {
      // dbGetSome('$rootScope.profileData.feed', userId, '', 'all');
      showFeed('profile', userId, 'listFilter', '', '');
      $rootScope.nav.view = 'user.feed';
    }

    getUserListOfLists(userId, '$rootScope.profileData.lists');

    // dbFactory.showUser(userId);
    //dbGetSome = function (theScope, userfilter, listfilter, sharedFilter)
    // Only navigate if it's not currently there.
    if ($state.current.name !== 'app.profile') {
      $state.go('app.profile', {
        userId: userId
      });
    }


    // Make sure that we have a valid title.
    headerTitle();

  };


  /* 10/4/2014, 11/3/2014 
    1/23/2015 - converted to promise
  */
  var promiseThing = function (thingId, userFilter) {
    // Todo2 - Enable userFilter

    // $rootScope.vars.modal.filter = 'all';
    var thingParams = $.param({
      token: $rootScope.token,
      thingId: thingId
    });
    var promise = $http({
        method: 'POST',
        url: apiPath + 'thingDetail',
        data: thingParams,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function (response) {
        {
          if (checkLogout(response.data) === true) {
            logout();
          } else {
            console.log()
              // $rootScope.modal.listStore = data.results;
            return response.data.results;

          }
        }
      });

    return promise;

  };




  /* Promise Get Some - get some with a promise 
    1/22/2015 - Created 
    userFIlter - enum('strangers','friends')
  */
  var promiseGetSome = function (userFilter, listFilter, sharedFilter) {

    console.log('getSomeDB  listfilter: ', listFilter, ' userfilter: ', userFilter, ' sharedFilter ', sharedFilter);

    // SharedFilter: 
    // TODO2 Can this be deleted 1/22 checkToken($rootScope.token);

    // eval (theScope + ' = []');

    var params = {
      type: 'user',
      userFilter: userFilter,
      listFilter: listFilter,
      token: $rootScope.token,
      sharedFilter: sharedFilter

    };
    // Fails: dbGetSome params Object {userfilter: "", listfilter: ""} 

    var promise = $http({
        method: 'POST',
        url: apiPath + 'getSome',
        data: $.param(params),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function (response) {
        console.log('promise? ', response);
        /*
         if(userFilter !== '0' && userFilter !== ''){
              // We know it's a user, so let's set local storage.
             localStorageService.set('user' + userFilter + sharedFilter, data.results);
            }

            if(listFilter !== '0' && listFilter !== '')
            {
              // We know it's a user, so let's set local storage.
             localStorageService.set('list' + listFilter + sharedFilter, data.results);
            }
          */
        return response.data.results;
      });

    //  console.log('dbGetSome params',params);
    return promise;

  };


  var headerTitle = function () {
    console.log('Load Header');
    // $rootScope.headerTitle = "";
    $rootScope.headerTitle = 'This';
    console.log('rsht', $rootScope.headerTitle);
  };

  /* Created 11/2/2014 */
  var fbTokenLogin = function (fbToken) {
    // The user has a valid Facebook token for plitto, and now wants to log into Plitto
    // Send the token to Plitto, which handles all Facebook communication from the PHP layer.
    var loginParams = $.param({
      fbToken: fbToken
    });
    $rootScope.loginMessage = 'Facebook Login in Progress';
    //console.log( "<h3>6. dbFactory.fbTokenLogin: " + fbToken + "</h3>");

    // $rootScope.loginMessage = loginParams;

    $http({
        method: 'POST',
        url: apiPath + 'fbToken',
        data: loginParams,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .success(
        function (data, status, headers, config) {

          if (checkLogout(data) === true) {
            logout();
          } else {
            console.log('TODO2 Use shc', status, headers, config);

            // Initialize the rootScope.
            dbInit();

            // $rootScope.$broadcast("getLoginStatus", {value:'value'});
            // $rootScope.$broadcast('getLoginStatus', { fbresponse: null});
            $rootScope.loginMessage = 'Plitto FB Login Complete';
            // console.log('database.fbTokenLogin response: TODO1 - DO NOT CALL TWICE ',data);

            // console.log('response from fbToken: ',data);
            // data.me.puid is the plitto userid. That should be there.
            if (data.me && data.me.puid && /^\+?(0|[1-9]\d*)$/.test(data.me.puid)) {
              console.log('puid is valid');
              // $rootScope.loginMessage = '<h3>8. PUID valid: ' + data.me.token + '. Redirect to app.home</h3>';
              $rootScope.loginMessage = 'Plitto User Information Received. Open App.';

              // Get the current time:
              var d = new Date();
              var theTime = d.getTime();

              // Set the stores. This is the only place where the User info is created. Otherwise, it's in local storage.
              $rootScope.user = {
                userId: data.me.puid,
                userName: data.me.username,
                fbuid: data.me.fbuid,
                unreadNotifications: 10,
                listCount: 10,
                thingCount: 10,
                lastRefresh: theTime
              };

              headerTitle();

              localStorageService.set('user', $rootScope.user);

              // Make the root token and the Local Storage
              $rootScope.token = data.me.token;
              localStorageService.set('token', data.me.token);

              updateCounts();

              // Make the root token and the Local Storage
              $rootScope.friendStore = data.friends;
              localStorageService.set('friendStore', data.friends);

              // Populate the initial "Ditto Some" view
              $rootScope.bite = data.getSome;
              localStorageService.set('bite', data.getSome);

              // FINALLY! - Load the interface
              // $state.go('app.home'); // TODO1 - This needs to be reflected in the URL.
              $rootScope.$broadcast('broadcast', {
                command: 'state',
                path: 'app.home',
                debug: 'dbFactory.fbTokenLogin - Go Home.'
              });

            } else {
              console.log('TODO1 There was an error. Log it.', data);
              // $state.go('app.login'); // TODO1 - This needs to be reflected in the URL. 11/2014 - THIS MIGHT WORK> NEEDS TO BE TESTED>
              $rootScope.$broadcast('broadcast', {
                command: 'state',
                path: 'login',
                debug: 'Login unsuccessful. Go back to login'
              });

              dbInit();
            }

          }



        }
      );
  };

  /* Gets their Plitto Friends, and adds it to the local store. 9/3/2014
      // 10/21/2014 This will only be called on a refresh, which isn't built yet.
  */
  var fbPlittoFriends = function (server) {
    console.log('TODO2 Use fbPlittoFriends.server', server);
    // Make the API call to get this user's friends.
    // console.log('rs server',$rootScope.server);

    $rootScope.nav.logging = false;
    // TODO2 - This needs to work. It should get called on every login.
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
    if (friendsData.length > 0) {

      var params = $.param({
        fbFriends: friendsData
      });
      $http({
          method: 'POST',
          url: apiPath + 'pFriends',
          data: params,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
        .success(
          function (data, status, headers, config) {

            if (checkLogout(data) === true) {
              logout();
            } else {
              // console.log('TODO2 database.pFriends Use shc', status, headers, config);

              // Handle the users, lists and things.
              // Add it to the scope, so it can be shown
              $rootScope.friendStore = data.result;

              // Update the local storage.
              localStorageAppend('fbLogin', data.result);
            }

          }
        );
    } else {
      var response = 'You should invite your friends to Plitto';
      // console.log('TODO2 use response? ',response);
    }
  };


  /* 9/7/2014
    Get the list of lists for this user, and from you and your friends
    1/22/2015 - Created the promise version of this.
  */
  var promiseListOfLists = function (friendId) {
    // TODO2 - load from local storage, if it's there 
    // console.log('database.getUserListOfLists: getUserListOfLists: friendId: ',friendId, ' theScope: ', theScope);


    var params = $.param({
      userfilter: friendId,
      token: $rootScope.token
    });
    // console.log('listoflists params: ',params);
    var promise = $http({
      method: 'POST',
      url: apiPath + 'listOfLists',
      data: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(function (response) {
      if (checkLogout(response.data) === true) {
        logout();
      } else {
        // console.log('TODO3 database.listOfLists: Use shc', status, headers, config);

        // Let the controller handle this.
        return response.data.results;

        // Add / Update to local storage
        localStorageService.set('user' + friendId + 'lists', data.results);

      }
    });
    return promise;

  };

  /* 9/7/2014
    Get the list of lists for this user, and from you and your friends
    1/22/2015 - This should be ready to delete on 1/24/2015
  
  var getUserListOfLists = function (friendId) {
    // TODO2 - load from local storage, if it's there 
    // console.log('database.getUserListOfLists: getUserListOfLists: friendId: ',friendId, ' theScope: ', theScope);


    var params = $.param({userfilter:friendId, token: $rootScope.token });
    // console.log('listoflists params: ',params);
    $http(
      {
        method:'POST',
        url: apiPath + 'listOfLists',
        data: params,
        headers: {'Content-Type':'application/x-www-form-urlencoded'}
      }
    )
    .success(
      function (data,status,headers,config) {
        
        if( checkLogout(data) === true ) {
          logout();
        } else {
          // console.log('TODO3 database.listOfLists: Use shc', status, headers, config);
          
          // Let the controller handle this.
          return data.results;

          // Add / Update to local storage
         localStorageService.set('user' + friendId + 'lists', data.results);

        }
        
      }
    );
  };
  */

  /* 9/7/2014
     Find shared if we don't know it.
  */
  var sharedStat = function (friendId) {
    // console.log('dbFactory.sharedState',friendId,$rootScope.friendStore);
    var friendStore = localStorageService.get('friendStore');
    //This will be in local storage, and in the friendStore.
    for (var i in friendStore) {
      // console.log('sharedStat loop');
      if (parseInt(friendStore[i].id) === parseInt(friendId)) {
        $rootScope.vars.modal.user.shared = friendStore[i].shared;
        $rootScope.vars.modal.user.dittoable = friendStore[i].dittoable;
        // console.log('found 32',$rootScope.vars.modal.user.shared , friendStore[i].shared);
        {
          break;
        }
      }
    }
  };




  /* 9/3/2014 */
  var showAList = function (listNameId, listName, userFilter, focus) {
    cleanOtherScope('list', 'db.showAList');
    // 
    // console.log('database.showAList: ',listNameId, listName , userFilter);

    console.log('todo1 - When focus - go straight to adding to a user list and open the keyboard. Focus: ', focus);

    if (focus === 'addToList') {
      console.log('DEBUG FOCUS addToList');
      $('input#newListItemField').css('border', '5px solid red');
      $('input#newListItemField').focus();
    } else {
      $('input#newListItemField').css('border', '0');
    }

    $rootScope.list = {
      listId: listNameId,
      listName: listName,
      mine: [
        {
          fbuid: $rootScope.user.fbuid,
          uid: $rootScope.user.userId,
          username: $rootScope.user.userName,
          lists: [
            {
              lid: listNameId,
              listname: listName,
              items: []
            }
          ]
        }
      ],
      ditto: [],
      shared: [],
      feed: [],
      strangers: []
    };

    // Load from local storage, if it exists.
    var viewTypes = new Array('ditto', 'shared', 'feed', 'strangers', 'mine');
    // console.log('database.showAList: ls get mine: ',localStorageService.get('listId' + listNameId + 'mine'));

    for (var i in viewTypes) {
      if (localStorageService.get('listId' + listNameId + viewTypes[i])) {
        if (viewTypes[i] === 'mine') {
          console.log('database.showAList: TODO3 this is mine. Why do we care?');

        }

        $rootScope.list[viewTypes[i]] = localStorageService.get('listId' + listNameId + viewTypes[i]);
        /* Deleted 1/21/2014 
        eval(
          '$rootScope.list.' +
          viewTypes[i] +
          ' =localStorageService.get("listId" + listNameId + "" + viewTypes[i] )'
        );
        */
      }
    }

    $rootScope.nav.listView = 'ditto';
    $state.go('app.list', {
      listId: listNameId
    });

    // var existing = [];
    // getMore ('list',listNameId, userFilter, existing);
    loadList(listNameId, listName, userFilter, 'ditto', 'all', null);

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

    // console.log('getMoreparams: ',params);
    $http({
        method: 'POST',
        url: apiPath + 'getMore',
        data: params,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .success(
        function (data, status, headers, config) {

          if (checkLogout(data) === true) {
            logout();
          } else {

            // console.log('database.getMore TODO3 Use shc', status, headers, config);
            // Append the data to the proper place.
            // console.log('data.results size',data.results,data.results.length);

            // Put it in the listStore if we know what it is
            if (type === 'list') {
              // TODO2 - Append rather than overwrite.
              $rootScope.list.items = data.results;
              // $rootScope.list.itemCount = data.results.length;
              // There isn't a benefit for local storage here, because it

              console.log('rootScope.list built by getMore: ', $rootScope.list.items);

            } else if (type === 'user') {
              console.log('database.getMore TODO2 - Build the place to store user information');
            }

          }

        }
      );
  };


  /* 9/6/2014 - 
    Get more must append the results, not just overwrite them 
    9/17/2014 - Building it to append. 
    11/5/2014 - This is currently not used.
  */
  var getMoreAppend = function (caption, params, data, id) {
    console.log('TODO2 Use getMoreAppend id', id);
    // Step 1. Get the key that should be in place for the local storage.
    var thefilter = '';
    var thekey = '';
    var gma = '';
    if ($rootScope.nav.modal === true && $rootScope.nav.filter === 'user') {
      thefilter = 'modalUser';
      thekey = 'userL_' + $rootScope.nav.filterId;
      gma = localStorageService.get(thekey);
      if (gma && gma.length > 0) {
        $rootScope.modal.listStore = gma;
      } else {
        gma = [];
      }
    } else if ($rootScope.nav.modal === true && $rootScope.nav.filter === 'list') {
      thefilter = 'modalList';
      thekey = 'listL_' + $rootScope.nav.filterId;
      console.log('list local storage key: ', thekey, data);

      // Existing
      var existingList = localStorageService.get(thekey);
      if (existingList) {
        console.log('list exists');
        gma = existingList;
        $rootScope.modal.listStore = gma;
      } else {
        console.log('list is null');
        gma = [];
        $rootScope.modal.listStore = gma;
      }
    } else {
      gma = [];
    }

    // console.log('starting GMA',gma);
    // console.log('dbFactory.getMoreAppend | params, data', params, data,'listStore start',$rootScope.modal.listStore, 'full scope',$rootScope);

    // Set the scope for processing.

    var shouldAppend = true;

    // Process the correct scope.
    if ($rootScope.nav.modal === true) {
      if (!$rootScope.modal.listStore || $rootScope.modal.listStore.length === 0) {
        // It was empty, so make it this data.
        $rootScope.modal.listStore = data;
        console.log('Don\'t append because the liststore is false, or it\'s 0.', $rootScope.modal.listStore, $rootScope.modal.listStore.length);
        shouldAppend = false;

        // Update the local storage.
        // var localKey = $rootScope.nav.filter + 'L_' + $rootScope.nav.filterid;
        if (thekey) {
          console.log('SET THE KEY', thekey);
          localStorageService.set(thekey, data);
        }

      } else {
        gma = $rootScope.modal.listStore;
      }
    } else {
      if ($rootScope.activityStore.length === 0) {
        console.log('Don\'t append because the activity store is empty.');
        shouldAppend = false;
        $rootScope.activityStore = data;
      } else {
        gma = $rootScope.activityStore;
      }
    }
    // console.log('gma rootscope',' shouldAppend: ',shouldAppend);

    if (shouldAppend === true) {
      // console.log('move to append','gma: ',gma);

      // Look at the existing content to seed matches.
      var userLists = [];
      for (var i in gma) {
        for (var j in gma[i].lists) {
          userLists.push({
            i: i,
            j: j,
            uid: gma[i].uid,
            lid: gma[i].lists[j].lid,
            used: false
          });
        }
      }

      // console.log('userLists:',userLists);
      // PROBLEM - One list is being added four times rather than being appended to an existing list once..

      for (var l in data) {
        // Inside the user loop.
        for (var m in data[l].lists) {
          // Inside the list loop

          // Check existing for matches.
          for (var z in userLists) {
            //console.log('append',parseInt(userLists[z].uid) , parseInt(data[i].uid) , parseInt(userLists[z].lid) , parseInt(data[i].lists[j].lid) );
            if (userLists[z].uid === data[l].uid && userLists[z].lid === data[l].lists[m].lid) {
              // console.log('matched existing.',data[i].lists[j].items);
              //
              console.log('to push to', gma[userLists[z].l].lists[userLists[z].m].items);
              console.log('add these items', data[l].lists[m].items);
              console.log('positions: ', l, m);
              gma[userLists[z].l].lists[userLists[z].m].items.push.apply(
                gma[userLists[z].l].lists[userLists[z].m].items,
                data[l].lists[m].items);

              userLists[z].used = true;
              data[l].lists[m].used = true;
            }
          }
        }
      }
    }
    // Update the local storage.

  };


  var newList = function (thingName, success, failure) {
    console.log('TODO2 Use newList.failure', failure);
    // Query the API and make the thing, if it needs to be made.
    var thingParams = $.param({
      thingName: thingName,
      token: $rootScope.token
    });
    $http({
        method: 'POST',
        url: apiPath + 'thingid',
        data: thingParams,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .success(
        function (data, status, headers, config) {

          if (checkLogout(data) === true) {
            logout();
          } else {
            console.log('database.newlist TODO2 Use shc', status, headers, config);
            var newListId = data.results[0].thingid;
            // 
            console.log('New List ID: ', newListId, 'thingname: ', thingName);

            // Callback - On creating the new list.
            success(newListId, thingName);
          }

        }
      );
  };

  /*  11.4.2014 - Updates friends, lists, user info on app re-launch 
      1/22/2015 - This mainly checks to see if the token is valid. 
  */
  var refreshData = function (token) {
    console.log('TODO2 Use refreshData.token', token);
    // This function will be called when the app loads, and already has a token. It's kind of like login.

    // Populate profile information
    if (localStorageService.get('user')) {
      $rootScope.user = localStorageService.get('user');
    }

    // Populate the friendstore.
    /* Deactivated 1/22/2015 
    if( localStorageService.get('friendStore')){
      // $rootScope.friendStore = localStorageService.get('friendStore');
    }
    */

    /* Deactivated 1/22/2015 
      // Populate the bite.
    if( localStorageService.get('bite')){
      $rootScope.bite = localStorageService.get('bite');
    }
    */

    // TODO1 Now, make the HTTP calls to refresh them.
    var checkParams = $.param({
      token: $rootScope.token
    });


    $http({
      method: 'POST',
      url: apiPath + 'checktoken',
      data: checkParams,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).success(
      function (data, status, headers, config) {

        console.log('db.refreshData data: ', data);

        if (checkLogout(data) === true) {
          logout();
        } else {
          // console.log('TODO2 Use shc', status, headers, config);
          console.log('typeof: ', data);
          if (data.error === true) {
            console.log('SOME KIND OF TOKEN ERROR');
            // Force log out, and clear local storage.
            logout();
          } else if (data.results && data.results[0].success && data.results[0].success === '1') {
            console.log('Check token results: ', data, data.results[0].success);

            // Update the "me" information.



            // Go to the home screen, but only if at login?.

            if ($state && $state.current && $state.current.name) {
              console.log('IRRELEVENT TEST db.refreshData 1581 passed. currentname: ', $state.current.name);
              if ($state.current.name === 'login' || $state.current.name === 'loading') {
                // dbGetSome( '$rootScope.bite' , '' , '', 'ditto');
                console.log('todo2 remove this. db.refreshdata1627. Loads a bite. Should happen in the home controller.');
              } else {
                console.log('not login or loading, but does exist.', $state.current.name);
              }
            } else {
              console.log('IRRELEVENT TEST db.refreshData 1641 failed');
            }



          } else {
            console.log('invalid token. Db1488');
            // ', data.results[0].success, data.results[0].success === '1');
          }

        }


      }
    );

  };


  /* Populate a list with all the different views, if they're there. */
  var loadList = function (listNameId, listName, userIdFilter, type, sharedFilter, oldestKey) {
    // console.log('database.loadList - rs.list before: ',$rootScope.list);
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
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).success(
      function (data, status, headers, config) {

        // console.log('loadList: ', data.results, data.results.length);
        // console.log('test ditto results', type, data.results['ditto'], data.results[type]);
        // console.log('database.loadlist: TODO3 Use shc', status, headers, config);

        if (checkLogout(data) === true) {
          logout();
        } else {

          var viewTypes = new Array('ditto', 'shared', 'feed', 'strangers', 'mine');
          // console.log( 'loadlist view types: ' , viewTypes, 'type: ', typeof (data.results[type].length));

          /* Must not be all, and  */
          if (
            //             (type !== 'all' && data.results.length === 0) ||
            type !== 'all'
          ) {
            console.log('database.loadlist 1231 type: ', type, 'empty?: ', data.results[type], data.results[type].length);

            /* Log legit no rows */
            if (data.results[type].length === 0) {
              $rootScope.list[type] = zeroRecords();
            } else {
              $rootScope.list[type] = data.results[type];
              localStorageService.set('listId' + listNameId + type, data.results[type]);
            }

            // eval('$rootScope.list.' + type + ' = "empty";');


          } else if (type === 'all') {
            for (var i in viewTypes) {
              // console.log('i: ',i, type[i]);

              // Build each type, but only clear the store if the request type was "all"
              // console.log('database.loadList Type response: ', typeof data.results[ viewTypes[i] ], viewTypes[i], data.results[ viewTypes[i] ], ' typeof: ',typeof (data.results[ viewTypes[i] ].rowcount) );

              console.log('DEBUG1179: ', viewTypes[i], typeof (data.results[viewTypes[i]].rowcount));


              if (!data.results[viewTypes[i]].length)
              // Clean out the store if there were no results
              {
                console.log('database.loadlist 1250 SHOW!!! type: ', viewTypes[i], data.results[viewTypes[i]]);
                if (viewTypes[i] !== 'mine') {
                  $rootScope.list[viewTypes[i]] = [];
                } else {
                  // Create an empty list so my item can be added.
                  $rootScope.list.mine = [
                    {
                      username: $rootScope.user.userName,
                      uid: $rootScope.user.userId,
                      fbuid: $rootScope.user.fbuid,
                      lists: [
                        {
                          lid: listNameId,
                          listname: listName,
                          items: []
                        }
                      ]
                    }
                  ];
                }
              } else {
                console.log('loadList ignore section:', viewTypes[i], data.results[viewTypes[i]]);
                // console.log('database.loadList - make type: ',viewTypes[i]);
                // Build the view
                $rootScope.list[viewTypes[i]] = data.results[viewTypes[i]];
                // Add this item to local storega.
                localStorageService.set('listId' +
                  listNameId +
                  viewTypes[i],
                  data.results[viewTypes[i]]);

              }

              if (localStorageService.get('listId' + listNameId + 'ditto')) {
                eval('$rootScope.list.' +
                  viewTypes[i] + '=localStorageService.get("listId" + listNameId +"' + viewTypes[i] + '");');
              }
            }
          } else {
            // Only update this specific part of the view.
            // console.log("EVAL THIS: " + "localStorageService.set('listId" + listNameId + type + "' , data.results." + type + ");");

            console.log('db1239 - This should not happen.');
            // And update the local storage
            // eval("localStorageService.set('listId' + listNameId +'" +  sharedFilter + "' , data.results." + sharedFilter + ");");
          }

          // console.log('type: ',type,' listNameId: ', listNameId, ' listName: ', listName, ' userIdFilter: ', userIdFilter, 'Success? rs.list: ',$rootScope.list);

        }


      }
    );
  };


  /* Async loading of a list 1/23/2015 
    Inputs:
      listNameId - the int for the the list.
      listName - The string of the list name
      userIdFilter - Filter for a specific user. '' for friends, 'strangers' for strangers
      $type = Array("ditto","shared","mine", "feed", "strangers");
  */
  var promiseList = function (listNameId, userIdFilter, viewType, sharedFilter, oldestKey) {
    //  
    console.log('dbFactory.promiseList | listNameId, userIdFilter, viewType, sharedFilter, oldestKey', listNameId, userIdFilter, viewType, sharedFilter, oldestKey);


    var params = $.param({
      id: listNameId,
      type: viewType,
      token: $rootScope.token,
      userIdFilter: userIdFilter,
      oldestKey: oldestKey,
      sharedFilter: sharedFilter
    });

    var promise = $http({
        method: 'POST',
        url: apiPath + 'loadList',
        data: params,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function (response) {

        if (checkLogout(response.data) === true) {
          logout();
        } else {
          console.log('res', response.data);
          console.log('database.loadlist 1231 viewType: ', viewType, 'empty?: ', response.data.results[viewType], response.data.results[viewType].length);

          /* Log legit no rows */
          if (response.data.results[viewType].length === 0) {
            console.log('no rows');
            localStorageService.set('listId' + listNameId + viewType, []);
            return [];
          } else {
            return response.data;
            localStorageService.set('listId' + listNameId + viewType, response.data.results[viewType]);
          }

        }
      });

    return promise;

  };


  // Add to a list. 1/23/2015 - Convert this to promise
  var addToList = function (addToListObj) {
    var addToListParams = $.param({
      thingName: addToListObj.thingName,
      listnameid: addToListObj.lid,
      token: $rootScope.token
    });
    // console.log('dbFactory.addToList | ',addToListParams);
    $http({
        method: 'POST',
        url: apiPath + 'addToList',
        data: addToListParams,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .success(
        function (data, status, headers, config) {

          if (checkLogout(data) === true) {
            logout();
          } else {
            console.log('Database.addToList:TODO3 Use shc', status, headers, config);
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

            console.log('Existing List: ', $rootScope.list.mine);
            if (!$rootScope.list.mine.length) {
              console.log('DEBUG1032no length');
            }
            if ($rootScope.list.mine.length === 0) {
              console.log('DEBUG1035 ZERO');
            }
            // Add my list if it's not already there.
            if (!$rootScope.list.mine.length || $rootScope.list.mine.length === 0) {
              console.log('make my list');
              // Make my list.
              var myList = {
                uid: $rootScope.user.userId,
                fbuid: $rootScope.user.fbuid,
                username: $rootScope.user.userName,
                lists: [
                  {
                    lid: addToListObj.lid,
                    listname: $rootScope.list.listName,
                    items: [myNewItem]
                }
              ]
              };

              // Make my list first 
              $rootScope.list.mine[0] = myList;

              console.log('my list: ', $rootScope.list.mine);

            } else {
              console.log(' This should exist: ', $rootScope.list.mine);
            }


            var i = 0;
            // console.log( 'database.addToList: what is in this new list? ', $rootScope.list, $rootScope.list.mine );

            // We need to look in my own list to see if the item is already there. If so, just activate it.
            for (i in $rootScope.list.mine[0].lists[0].items) {
              if ($rootScope.list.mine[0].lists[0].items[i].tid === item.thingid) {
                myThingAlready = i;
              }
            }
            // console.log('didList',didList, 'myListPosition', myListPosition, 'myThingAlready', myThingAlready);


            // If my list doesn't exist yet, create it.

            console.log('my existing list: ', $rootScope.list.mine[0], $rootScope.list.mine[0].lists[0]);

            // Add my item to my list, but only if it's not already there.
            if (myThingAlready === -1) {
              // console.log($rootScope.modal.listStore[0]);

              // console.log('RootStore before I build', $rootScope.list.items);
              $rootScope.list.mine[0].lists[0].items.unshift(myNewItem);
            } else {
              // Move my old item to the top of your list & remove the old one.
              $rootScope.list.mine[0].lists[0].items.splice(myThingAlready, 1);
              // Insert the new one with "now"
              $rootScope.list.mine[0].lists[0].items.unshift(myNewItem);
            }

          }

        }
      );
  };

  // Add to a list. 1/23/2015 - Convert this to promise
  var promiseAddToList = function (addToListObj) {
    var addToListParams = $.param({
      thingName: addToListObj.thingName,
      listnameid: addToListObj.lid,
      token: $rootScope.token
    });
    // console.log('dbFactory.addToList | ',addToListParams);
    var promise = $http({
        method: 'POST',
        url: apiPath + 'addToList',
        data: addToListParams,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(
        function (response) {

          if (checkLogout(response.data) === true) {
            logout();
          } else {

            var item = response.data.results[0];

            var myNewItem = {
              mykey: item.thekey,
              tid: item.thingid,
              thingname: item.thingname,
              added: 'now',
              dittokey: 0,
              dittouser: null,
              dittousername: null
            };

            return myNewItem;

          }

        }
      );
    return promise;
  };

  // Promise Thing Info - Load a list info for when a user creates a list.
  var promiseThingName = function (thingId) {
    var params = $.param({
      token: $rootScope.token,
      thingId: thingId
    });
    // console.log('dbFactory.addToList | ',addToListParams);
    var promise = $http({
        method: 'POST',
        url: apiPath + 'thingName',
        data: params,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(
        function (response) {

          if (checkLogout(response.data) === true) {
            logout();
          } else {

            return response.data;

          }

        }
      );
    return promise;
  };



  /* 10/3/2014 - Search 
    1/23/2015 - Converted to Promise
  */
  var promiseSearch = function (searchTerm, searchFilter) {
    var searchParams = $.param({
      token: $rootScope.token,
      search: searchTerm,
      searchFilter: searchFilter
    });

    var promise = $http({
        method: 'POST',
        url: apiPath + 'search',
        data: searchParams,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(
        function (response) {

          if (checkLogout(response.data) === true) {
            logout();
          } else {
            return response.data;

          }


          // For the user and the list, change the increments of dittoable and in common.
        }
      );
    return promise
  };

  return {
    fbPlittoFriends: fbPlittoFriends,
    plittoFBApiCall: plittoFBApiCall,
    /* removed 1/23/2015 dbGetSome: dbGetSome, */
    /* removed 1/23/2015     dbDitto: dbDitto, */

    // getUserListOfLists: getUserListOfLists, /* Replaced on 1/23/2015 */
    sharedStat: sharedStat,
    /* 9/7/2014 */
    // , modalReset: modalReset
    showAList: showAList,
    getMore: getMore,
    getMoreAppend: getMoreAppend,
    newList: newList,
    addToList: addToList,
    /* Removed 1/23/2015 search: search, */
    /* Removed 1/23/2015 showThing: showThing, */
    showUser: showUser,
    showFeed: showFeed,
    loadList: loadList,
    fbTokenLogin: fbTokenLogin,
    refreshData: refreshData,
    dbInit: dbInit,
    /* Initializes the rootscope */
    /* Removed 1/23/2015 mainFeed: mainFeed, // Updates the main feed */
    loadFeed: loadFeed,
    /* Loads in the feed from local storage */

    /* userChat: userChat, Returns the chat queue for a user. TODO2 - Return this as a promise. */
    /* updateCounts: updateCounts, TODO2 - Convert to promise and return. updates the notification, Friend, etc numbers. */
    logout: logout,
    /* This is redundant, and also exists in controllers.js. That should change TODO2 */
    friendsList: friendsList,
    /* Let a user reloat their friend store. Long facebook logins made this needed. 1/21/2015 */
    cleanOtherScope: cleanOtherScope,
    /* Keep RootScope clean. */
    userInfo: userInfo,
    /* Get user info for the profile page for reloading in it */


    promiseAddComment: promiseAddComment,
    /* Adds a comment to the item 1/23/2015 - Changed to promise */
    promiseThing: promiseThing,
    /* modified to promise 1/23/2015 */
    promiseSearch: promiseSearch,
    /* Added 1/23/2015 */
    promiseDitto: promiseDitto,
    /* Replace the one above. 1/22/2015 */
    promiseGetSome: promiseGetSome,
    /* Async get some */
    promiseFeed: promiseFeed,
    /* Async Feed */
    promiseListOfLists: promiseListOfLists,
    /* Async lol */
    promiseList: promiseList,
    /* 1/23/2015 - Async list */
    promiseAddToList: promiseAddToList,
    /* 1/23/2015 - Async add to list */
    promiseThingName: promiseThingName /* 1/23/2015 - Async get info about a thing */
  };

}]);



/* 10/3/2014 - Search - Removed 1/23/2015
var search = function (searchTerm, searchFilter) {
  var searchParams = $.param({token: $rootScope.token, search: searchTerm , searchFilter: searchFilter });

  $http(
    {
      method:'POST',
      url: apiPath + 'search',
      data: searchParams ,
      headers: {'Content-Type':'application/x-www-form-urlencoded'}
    }
  )
  .success(
    function (data,status,headers,config) {
      
      if( checkLogout(data) === true ) {
        logout();
      } else {
        console.log('TODO2 Use shc', status, headers, config);
        $rootScope.searchResults = data.results;
        console.log('data.results', data.results);

      }
      
      
    // For the user and the list, change the increments of dittoable and in common.
    }
  );
};
*/


/* Get Some - things to ditto 
  9/23/2014 - Created 
  1/24/2015 - Removed
  
var dbGetSome = function ( userFilter, listFilter, sharedFilter) {
  // 
  console.log('getSomeDB  listfilter: ', listFilter ,' userfilter: ',userFilter, ' sharedFilter ', sharedFilter);
  
  // SharedFilter: 
  // TODO2 Can this be deleted 1/22 checkToken($rootScope.token);

  // eval (theScope + ' = []');

  var params = {
    type: 'user',
    userFilter: userFilter,
    listFilter: listFilter,
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
    .success(
      function (data,status,headers,config) {
        return {good: 'for you', bad: 'for me'};
        
        if( checkLogout(data) === true ) {
          logout();
        } else {
          //             console.log('database.getSome TODO2 Use shc', status, headers, config);
          console.log('getSome results: ', data.results);
         
          return data.results

          if(userFilter !== '0' && userFilter !== ''){
            // We know it's a user, so let's set local storage.
           localStorageService.set('user' + userFilter + sharedFilter, data.results);
          }

          if(listFilter !== '0' && listFilter !== '')
          {
            // We know it's a user, so let's set local storage.
           localStorageService.set('list' + listFilter + sharedFilter, data.results);
          }

          // Testing returning it so it can be part of the rootScope:
          // return data.results;
          
          // console.log('dbFactory.getActivity data: ',data);

        }

      }
        
    );
};
*/

/*
  /* 9/4/2014 - 9/3/2014 - Handle the ditto action 
      10/21/2014 - Vastly improved this.
      1/22/2015 - Should be able to disable this by 1/24. Replaced by promiseDitto
  

  // dbFactory.dbDitto('bite',i,j,k,mykey,uid,lid,tid);      

  var dbDitto = function (scopeName, mykey, uid, lid, tid, itemKey, event ) {
    //  console.log('dbFactory.dbDitto | mykey: ', mykey,'| ownerid: ', uid, '| listid: ',lid, tid,i,j,k);
    var i,j,k;

    // This is for updating the current scope in other places. TODO2 - Test Later.
    findItem:{
      // 
      for(i in eval('$rootScope.' + scopeName)){
      console.log('scopeName', scopeName);
      // for(i in $rootScope[scopeName]){
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
    var action = 'remove';
    if(mykey === null) {
      // My key is null, so this must be a ditto.
      // console.log('update action ditto', mykey, parseInt(mykey));
      action = 'ditto';
    }

    var dittoParams = $.param(
      {
        action: action ,
        itemKey: itemKey,
        token: $rootScope.token
      }
    );

    $http(
      {
        method:'POST',
        url: apiPath + 'ditto',
        data: dittoParams,
        headers: { 'Content-Type':'application/x-www-form-urlencoded' }
      }
    )
    .success(
      function (data,status,headers,config) {
        
        if( checkLogout(data) === true ) {
          logout();
        } else {
          console.log('Ditto Response TODO2 Use shc', status, headers, config);
          var mynewkey = null;
          if(action === 'ditto') {

            mynewkey  = data.results[0].thekey;
            var friendsWith = data.results[0].friendsWith;

            // Update the "Friends With" 
            // $(event.target).html('+' + friendsWith +' <i style="ionicon ion-ios7-checkmark"></i>').removeClass('ion-ios7-checkmark-outline').addClass('ion-ios7-checkmark');

            $(event.target).addClass('ion-ios7-checkmark').removeClass('ion-ios7-checkmark-outline');

            // Update this item's new "Friends With"
              // 
            eval('$rootScope.' + scopeName + '[i]["lists"][j]["items"][k].friendsWith = "+ ' +friendsWith + '"');
            console.log('scopeName', scopeName);  
            // $rootScope[scopeName][i]["lists"][j]["items"][k].friendsWith = friendsWith;

            // For the user and the list, change the increments of dittoable and in common.
          } else {

            // It was removed. Finalize that.
            $(event.target).removeClass('ion-ios7-checkmark').addClass('ion-ios7-checkmark-outline');
            // 
            eval('$rootScope.' + scopeName + '[i]["lists"][j]["items"][k].friendsWith = ""');
            // $rootScope[scopeName][i]["lists"][j]["items"][k].friendsWith = "";
          }

          // Update my key within the correct scope.
          // Results update
          //  console.log('rs sn: ',scopeName, $rootScope[scopeName]);
          // This must be an eval, because scopeName can be profileData.feed, or someother multi-parter. 
          eval('$rootScope.' + scopeName + '[i]["lists"][j]["items"][k].mykey = ' +mynewkey);
          // $rootScope[scopeName][i]["lists"][j]["items"][k].mykey = mynewkey;
        }
      }
    );

  };
  */