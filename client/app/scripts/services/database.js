'use strict';
angular.module('Services.database', ['LocalStorageModule'])

// This will handle storage within local databases.
.factory('dbFactory', ['$http', '$rootScope', '$state', 'localStorageService','pltf', function ($http, $rootScope, $state, localStorageService, pltf) {
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
    // console.log('logout');
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

  
  var promiseDitto = function (mykey, uid, lid, tid, itemKey, event) {
    //  console.log('dbFactory.dbDitto | mykey: ', mykey,'| ownerid: ', uid, '| listid: ',lid, tid,i,j,k);

    // Update the action, by whether or not the first item is null or not.
    var action = 'remove';
    if (mykey === null) {
      // My key is null, so this must be a ditto.
      // console.log('update action ditto', mykey, parseInt(mykey));
      action = 'ditto';
    }

    // console.log('Ditto Action: ', action, ' itemKey: ', itemKey);

    /* If this works, we can remove Jquery, completely? */
    var dittoParams = {
      action: action,
      itemKey: itemKey,
      token: $rootScope.token
    };

    var promise = $http.post(apiPath + 'ditto', dittoParams)
      .then(function (response) {
          console.log('promise ditto. api response: ', response);

          if (checkLogout(response.data) === true) {
            logout();
          } else {
            // console.log('Ditto Response TODO2 Use shc', status, headers, config);
            var mynewkey = null;
            var friendsWith = null;
            console.log('results key type of: ' + typeof response.data.results[0].thekey === 'undefined');
            if (action === 'ditto') {
              
              if(typeof response.data.results[0].thekey === 'undefined'){
                console.log('promieDitto did not get a key.');
              }
              mynewkey = response.data.results[0].thekey;
              friendsWith = response.data.results[0].friendsWith;
            } else {
              // the action must have been 'remove'
              
            }
          }
          var pDittoArray = new Array(mynewkey, friendsWith, action);
          // return pDittoArray;
          return pDittoArray;
        },
        function (response) {
          // Error handling here.
          console.log('promiseDitto data error: ', response);
        }
      );

    return promise;

  };


  /* For the Friends Page. */
  var friendsList = function () {
    // console.log('!!!UpdateCounts');

    var params = {
      token: $rootScope.token
    };

    var promise = $http.post(apiPath + 'friendsList', params)
      .then(function (response) {

          if (checkLogout(response.data) === true) {
            logout();
          } else {
            return response.data.results;
          }
        },
        function (response) {
          // Error handling here.
          console.log('friendslist data error: ', response);
        }

        // console.log("profile feed after showfeed",$rootScope.profileData.feed);
      );
    return promise;
    // console.log("New Alert Count: ", $rootScope.stats.alerts.total);
  };


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
    var params = {
      token: $rootScope.token,
      uid: uid,
      lid: lid,
      tid: tid,
      itemKey: itemKey,
      comment: newComment,
      status: status
    };

    var promise = $http.post(apiPath + 'addComment', params)
      .then(function (response) {

          if (checkLogout(response.data) === true) {
            logout();
          } else {
            console.log('addCommentResponse', response);
            return response.data;
          }
        },
        function (response) {
          // Error handling here.
          console.log('promiseAddComment data error: ', response);
        }
        // console.log("profile feed after showfeed",$rootScope.profileData.feed);
      );

    return promise;

  };


  var dbInit = function (fCallback) {
    localStorageService.set('buildDate', '2015-01-27');
    localStorageService.set('buildId', '100');

    // These have been used and referenced since Nov 4, 2014.
    $rootScope.token = null;

    $rootScope.debugOn = false; // Debug
    $rootScope.loginMessage = ''; // Also debug, but that's in how you use it.


    $rootScope.loginMessage = 'RS initialized.';


    if (typeof fCallback === 'function') {
      //console.log('fCallback in init made');
      fCallback('complete');
    }
  };



  /* Function to return basic (public) information about a user based on their user id. */
  var userInfo = function (userId) {

    var params = {
      uid: userId,
      token: $rootScope.token
    };

    var promise = $http.post(apiPath + 'userInfo', params)
      .then(
        function (response) {

          if (checkLogout(response.data) === true) {
            logout();
          } else {
            console.log('UserInformation!!! - return this: ', response.data.results);
            return response.data;

          }


          // console.log("profile feed after showfeed",$rootScope.profileData.feed);
        },
        function (response) {
          // Error handling here.
          console.log('userInfo data error: ', response);
        }
      );
    return promise;
  };

  /* 10/22/2014 
    1/22/2015 - Added and made async. 
  */
  var promiseFeed = function (theType, userFilter, listFilter, myState, continueKey, newerOrOlder) {
    console.log('promise feed theType, userFilter, listFilter, myState, continueKey, newerOrOlder', theType, userFilter, listFilter, myState, continueKey, newerOrOlder);
    var params = {
      theType: theType,
      userFilter: userFilter,
      listFilter: listFilter,
      myState: myState,
      continueKey: continueKey,
      newerOrOlder: newerOrOlder,
      token: $rootScope.token
    };



    var promise = $http.post(apiPath + 'showFeed', params)
      .then(function (response) {
          if (checkLogout(response.data) === true) {
            logout();
          } else {
            // console.log('TODO2 database.showfeed Use shc', data, status, headers, config);
            // Error Handling - TODO1 - Add error handling to all calls.
            if (typeof response.data.logout !== 'undefined') {
              console.log('API ERROR', response.data);
              if (response.data.logout === true) {
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


            if (userFilter !== '0' && userFilter !== '') {
              // We know it's a user, so let's set local storage.
              localStorageService.set('user' + userFilter + 'feed', response.data.results);
            }

            return response.data.results;
          }

          // console.log("profile feed after showfeed",$rootScope.profileData.feed);
        },
        function (response) {
          // Error handling here.
          console.log('showFeed data error: ', response);
        }
      );
    return promise;


  };


  /* 10/4/2014, 11/3/2014 
    1/23/2015 - converted to promise
  */
  var promiseThing = function (thingId, userFilter) {
    // Todo2 - Enable userFilter

    // $rootScope.vars.modal.filter = 'all';
    var thingParams = {
      token: $rootScope.token,
      thingId: thingId
    };
    var promise = $http.post(apiPath + 'thingDetail', thingParams)
      .then(function (response) {
          {
            if (checkLogout(response.data) === true) {
              logout();
            } else {
              // $rootScope.modal.listStore = data.results;
              return response.data.results;

            }
          }
        },
        function (response) {
          // Error handling here.
          console.log('thingParams data error: ', response);
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

    var promise = $http.post(apiPath + 'getSome', params)
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
        },
        function (response) {
          // Error handling here.
          console.log('getSome data error: ', response);
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
    var loginParams = {
      fbToken: fbToken
    };
    $rootScope.loginMessage = 'Facebook Login in Progress';
    //console.log( "<h3>6. dbFactory.fbTokenLogin: " + fbToken + "</h3>");

    // $rootScope.loginMessage = loginParams;

    var promise = $http.post(apiPath + 'fbToken', loginParams)
      .then(
        function (response) {

          if (checkLogout(response.data) === true) {
            logout();
          } else {
            // console.log('TODO2 Use shc', status, headers, config);

            // Initialize the rootScope.
            dbInit();

            // $rootScope.$broadcast("getLoginStatus", {value:'value'});
            // $rootScope.$broadcast('getLoginStatus', { fbresponse: null});
            $rootScope.loginMessage = 'Plitto FB Login Complete';
            // console.log('database.fbTokenLogin response: TODO1 - DO NOT CALL TWICE ',data);

            // console.log('response from fbToken: ',data);
            // data.me.puid is the plitto userid. That should be there.
            if (response.data.me && response.data.me.puid && /^\+?(0|[1-9]\d*)$/.test(response.data.me.puid)) {
              console.log('puid is valid');
              // $rootScope.loginMessage = '<h3>8. PUID valid: ' + data.me.token + '. Redirect to app.home</h3>';
              $rootScope.loginMessage = 'Plitto User Information Received. Open App.';

              // Get the current time:
              var d = new Date();
              var theTime = d.getTime();

              // Set the stores. This is the only place where the User info is created. Otherwise, it's in local storage.
              $rootScope.user = {
                userId: response.data.me.puid,
                userName: response.data.me.username,
                fbuid: response.data.me.fbuid,
                unreadNotifications: 10,
                listCount: 10,
                thingCount: 10,
                lastRefresh: theTime
              };

              headerTitle();

              localStorageService.set('user', $rootScope.user);

              // Make the root token and the Local Storage
              $rootScope.token = response.data.me.token;
              localStorageService.set('token', response.data.me.token);

              // TODO2 Later? updateCounts();

              // Make the root token and the Local Storage
              localStorageService.set('friendStore', response.data.friends);

              // Populate the initial "Ditto Some" view
              // $rootScope.bite = data.getSome;
              localStorageService.set('bite', response.data.getSome);

              // FINALLY! - Load the interface
              // $state.go('app.home'); // TODO1 - This needs to be reflected in the URL.
              $state.go('app.home');
              /* Removed 1/28/2015
              $rootScope.$broadcast('broadcast', {
                command: 'state',
                path: 'app.home',
                debug: 'dbFactory.fbTokenLogin - Go Home.'
              });
              */

            } else {
              console.log('TODO1 There was an error. Log it.', response.data);
              // $state.go('app.login'); // TODO1 - This needs to be reflected in the URL. 11/2014 - THIS MIGHT WORK> NEEDS TO BE TESTED>
              /* Removed 1/28
              $rootScope.$broadcast('broadcast', {
                command: 'state',
                path: 'login',
                debug: 'Login unsuccessful. Go back to login'
              });
              */
              $state.go('login');

              dbInit();
            }

          }



        }
      );

    return promise;
  };

  /* Gets their Plitto Friends, and adds it to the local store. 9/3/2014
      // 10/21/2014 This will only be called on a refresh, which isn't built yet. 
  
  var fbPlittoFriends = function (server) {
    console.log('TODO2 Use fbPlittoFriends.server', server);
    // Make the API call to get this user's friends.
    // console.log('rs server',$rootScope.server);

    $rootScope.nav.logging = false;
    // TODO2 - This needs to work. It should get called on every login.
    FB.api('/me/friends', function (response) {
      // console.log('my friends: ',response.data);
      // Using this, call the Plitto API to log this users friends
      // TODO3 - What was this? Do we use this? plittoFBApiCall(response.data);
    });
  };
  */

  /* 9/7/2014
    Get the list of lists for this user, and from you and your friends
    1/22/2015 - Created the promise version of this.
  */
  var promiseListOfLists = function (userId) {
    // TODO2 - load from local storage, if it's there 
    // 
    console.log('database.getUserListOfLists: getUserListOfLists: userId: ' + userId );


    var params = {
      userfilter: userId,
      token: $rootScope.token
    };
    // console.log('listoflists params: ',params);
    var promise = $http.post(apiPath + 'listOfLists', params)
      .then(function (response) {
          if (checkLogout(response.data) === true) {
            logout();
          } else {
            // console.log('TODO3 database.listOfLists: Use shc', status, headers, config);
            // TODO2 - Log the error if an input was incorrect. Don't overwrite local storage with bad data.
            // Add / Update to local storage
            localStorageService.set('user' + userId + 'lists', response.data.results);

            // Let the controller handle this.
            return response.data.results;


          }
        },
        function (response) {
          // Error handling here.
          console.log('listoflists data error: ', response);
        });
    return promise;

  };


  /*  11.4.2014 - Updates friends, lists, user info on app re-launch 
      1/22/2015 - This mainly checks to see if the token is valid. 
      1/27/2015 - Disable to see if we use this. Yep. We use it. */

  var refreshData = function (token) {
    console.log('TODO2 Use refreshData.token', token);
    // This function will be called when the app loads, and already has a token. It's kind of like login.

    // Populate profile information
    if (localStorageService.get('user')) {
      $rootScope.user = localStorageService.get('user');
    }

    // TODO1 Now, make the HTTP calls to refresh them.
    var params = {
      token: $rootScope.token
    };

    var promise = $http.post(apiPath + 'checktoken', params)
      .then(function (response) {
          console.log('db.refreshData data: ', response.data);

          if (checkLogout(response.data) === true) {
            logout();
          } else {
            // console.log('TODO2 Use shc', status, headers, config);
            // console.log('responsedata typeof: ', response.data);
            if (response.data.results && response.data.results[0].success && response.data.results[0].success === '1') {
              console.log('Check token results: ', response.data, response.data.results[0].success);


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

              return response.data;

            } else {
              console.log('invalid token. Db1488');
              // ', data.results[0].success, data.results[0].success === '1');
            }

          }
        },
        function (response) {
          // Error handling here.
          console.log('checkToken data error: ', response);
        });
    return promise;



  };


  /* Async loading of a list 1/23/2015 
    Inputs:
      listNameId - the int for the the list.
      listName - The string of the list name
      userIdFilter - Filter for a specific user. '' for friends, 'strangers' for strangers
      $type = Array("ditto","shared","mine", "feed", "strangers");
  */
  var promiseList = function (listNameId, userIdFilter, viewType, sharedFilter, oldestKey) {

    
    var params = {
      id: listNameId,
      type: viewType,
      token: $rootScope.token,
      userIdFilter: userIdFilter,
      oldestKey: oldestKey,
      sharedFilter: sharedFilter
    };

    var promise = $http.post(apiPath + 'loadList', params)
      .then(function (response) {
          if (checkLogout(response.data) === true) {
            logout();
          } else {

            /* Log legit no rows */
            if (response.data.results[viewType].length === 0) {
              localStorageService.remove('listId' + listNameId + viewType );
            } else {
              localStorageService.set('listId' + listNameId + viewType, response.data.results[viewType]);
            }
            return response.data;

          }
        },
        function (response) {
          // Error handling here.
          console.log('promiseList data error: ' + response);
        });

    return promise;

  };



  // Add to a list. 1/23/2015 - Convert this to promise
  var promiseAddToList = function (addToListObj) {
    var addToListParams = {
      thingName: addToListObj.thingName,
      listnameid: addToListObj.lid,
      token: $rootScope.token
    };
    // console.log('dbFactory.addToList | ',addToListParams);
    var promise = $http.post(apiPath + 'addtoList', addToListParams)
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
              dittousername: null,
              ik: item.ik
            };
            console.log('db685 myNewItem (ID) ' + myNewItem);
            return myNewItem;
          }
        },
        function (response) {
          // Error handling here.
          console.log('addToList data error: ', response);
        }
      );
    return promise;
  };

  // Promise Thing Info - Load a list info for when a user creates a list.
  var promiseThingName = function (thingId) {
    var params = {
      token: $rootScope.token,
      thingId: thingId
    };
    // console.log('dbFactory.addToList | ',addToListParams);
    var promise = $http.post(apiPath + 'thingName', params)
      .then(
        function (response) {
          if (checkLogout(response.data) === true) {
            logout();
          } else {
            return response.data;
          }
        },
        function (response) {
          // Error handling here.
          console.log('promise thing name data error: ', response);
        }
      );
    return promise;
  };



  /* 10/3/2014 - Search 
    1/23/2015 - Converted to Promise
  */
  var promiseSearch = function (searchTerm, searchFilter) {
    var searchParams = {
      token: $rootScope.token,
      search: searchTerm,
      searchFilter: searchFilter
    };

    var promise = $http.post(apiPath + 'search', searchParams)
      .then(
        function (response) {
          if (checkLogout(response.data) === true) {
            logout();
          } else {
            return response.data;
          }
          // For the user and the list, change the increments of dittoable and in common.
        },
        function (response) {
          // Error handling here.
          console.log('promiseSearch data error: ', response);
        }
      );
    return promise;
  };
  
  /* Restored on 1/28/2015. We needed it. */
  var newList = function (thingName) {
    // console.log('TODO2 Use newList.failure', failure);
    // Query the API and make the thing, if it needs to be made.
    var thingParams = {
      thingName: thingName,
      token: $rootScope.token
    };
    var promise = $http.post(apiPath + 'thingid', thingParams)
      .then(
        function ( response ) {
          if (checkLogout( response.data ) === true) {
            logout();
          } else {
            
            var newListId = response.data.results[0].thingid;
            console.log('new list id created: ' + newListId);
            // Callback - On creating the new list.
            return newListId;
            
          }
        },
        function(response){
          console.log('promise error for new list?');
        }
      );
    return promise;
  };
  
  
  var getMore = function(fromUserId, listId, filter, ignoreTids, moreRecords){
    var params = {
      fromUserId: fromUserId, // Could be a string, I suppose.
      listId: listId, // 0 if you want all.
      filter: filter, // Shared, dittoable, etc. For now, not built. 1/29/2015
      ignoreTids: ignoreTids.join(), // CSV of the existing TIDs in play.
      token: $rootScope.token,
      moreRecords: moreRecords
    };
    // console.log('params: ', params);
    var promise = $http.post(apiPath + 'getMore', params)
      .then(
        function ( response ) {
          if (checkLogout( response.data ) === true) {
            logout();
          } else {
            // console.log('db get more response: ', response);
            return response.data;
          }
        },
        function(response){
          console.log('promise error for new list?');
        }
      );
    return promise;
  };

  return {
    // fbPlittoFriends: fbPlittoFriends,
    getMore: getMore, /* Added 1/29/2015 */
    fbTokenLogin: fbTokenLogin,
    refreshData: refreshData,
    dbInit: dbInit,
    logout: logout,
    friendsList: friendsList,
    userInfo: userInfo,
    newList: newList, 
    promiseAddComment: promiseAddComment,
    promiseThing: promiseThing,
    promiseSearch: promiseSearch,
    promiseDitto: promiseDitto,
    promiseGetSome: promiseGetSome,
    promiseFeed: promiseFeed,
    promiseListOfLists: promiseListOfLists,
    promiseList: promiseList,
    promiseAddToList: promiseAddToList,
    promiseThingName: promiseThingName /* 1/23/2015 - Async get info about a thing */
  };

}]);