'use strict';
// Ionic Starter App, v0.9.20

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('Plitto', [
  'ionic',
  //'config',
  'ngResource',
  // 'Plitto.controllers',
  'Plitto.services',
  'angularMoment',
  'LocalStorageModule',
  'pRun',
  'pConstant',
  'chatDirective',
  'listOfListsDirective',
  'userNavDirective',
  'userListThingController',
  // 'pController',
  'userDirective',
  'viewConfig',
  'addListController',
  'homeController',
  'friendsController',
  'chatController',
  'debugController',
  'searchController',
  'userController',
  'thingController',
  'loginController',
  'docsController',
  'listsController',
  'listController',
  'loadingController',
  'feedContrller',
  'appController'
], function ($httpProvider) {
  // Use x-www-form-urlencoded Content-Type
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

  /**
   * The workhorse; converts an object to x-www-form-urlencoded serialization.
   * @param {Object} obj
   * @return {String}
   */
  var param = function (obj) {
    var query = '',
      name, value, fullSubName, subName, subValue, innerObj, i;

    for (name in obj) {
      value = obj[name];

      if (value instanceof Array) {
        for (i = 0; i < value.length; ++i) {
          subValue = value[i];
          fullSubName = name + '[' + i + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      } else if (value instanceof Object) {
        for (subName in value) {
          subValue = value[subName];
          fullSubName = name + '[' + subName + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      } else if (value !== undefined && value !== null) {
        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
      }
    }

    return query.length ? query.substr(0, query.length - 1) : query;
  };

  // Override $http service's default transformRequest
  $httpProvider.defaults.transformRequest = [function (data) {
    return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
  }];
});
'use strict';
angular.module('Plitto.services', [
  'Services.database',
  'Services.pFb',
  'Services.oauth'
]);
'use strict';
angular.module('Services.database', ['LocalStorageModule'])

// This will handle storage within local databases.
.factory('dbFactory', ['$http', '$rootScope', '$state', 'localStorageService', function ($http, $rootScope, $state, localStorageService) {
  /* configure Constants */
  var apiPath = (window.cordova) ? 'http://plitto.com/api/2.0/' : '/api/2.0/';

  /* This is for when there are no records.
  function zeroRecords() {
    return {
      'msg': 'No Records',
      'time': Date.now()
    };
    // console.log('dbFactory.zerorecords zero records: ', now());
  }
  */

  function logout() {
    // console.log('logout');
    // $rootScope.debug('Appctrl - TODO2: FB Logout call.');
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

  var promiseDitto = function (mykey, uid, lid, tid, itemKey) {
    //  console.log('dbFactory.dbDitto | mykey: ', mykey,'| ownerid: ', uid, '| listid: ',lid, tid,i,j,k);

    // Update the action, by whether or not the first item is null or not.
    var action = 'remove';
    if (mykey === null) {
      action = 'ditto'; // My key is null, so this must be a ditto.
    }
    //     console.log('Ditto Action: ', action, ' itemKey: ', itemKey);

    /* If this works, we can remove Jquery, completely? */
    var dittoParams = {
      action: action,
      itemKey: itemKey,
      token: $rootScope.token
    };

    var promise = $http.post(apiPath + 'ditto', dittoParams)
      .then(function (response) {
          // console.log('promise ditto. api response: ', response);
          var mynewkey = null;
          var friendsWith = null;
          if (checkLogout(response.data) === true) {
            logout();
          } else {
            // console.log('Ditto Response TODO2 Use shc', status, headers, config);


            // console.log('results key type of: ' + typeof response.data.results[0].thekey === 'undefined');
            if (action === 'ditto') {
              /*
              if (typeof response.data.results[0].thekey === 'undefined') {
                console.log('promieDitto did not get a key.');
              }
              -- Server side should log an error here. TODO2 
              */
              mynewkey = response.data.results[0].thekey;
              friendsWith = response.data.results[0].friendsWith;
            }
            /*DO NOTHING HERE FOR SOME REASON.
                        else {
                          // the action must have been 'remove'
                          console.log('what to do when removing a ditto?');
                        } */
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

  /* 11/2/2014
  var checkToken = function (token) {
    // console.log('check the token to see if we should proceed.');
    if (typeof token === 'undefined' || token.length === 0) {
      // TODO1 - Conditition around this, if there is a token in the querystring. $state.go("login");
      dbInit();
    }

  };
  */

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

            if (theType === 'friends' || theType === 'strangers') {
              console.log('feed' + theType[0].toUpperCase());
              localStorageService.set('feed' + theType[0].toUpperCase() + theType.slice(1), response.data.results);
            } else if (userFilter !== '0' && userFilter !== '') {
              // We know it's a user, so let's set local storage.
              localStorageService.set('user' + userFilter + 'feed', response.data.results);
            } else {
              // don't set the local storage.
            }

            return {
              results: response.data.results,
              type: theType
            };
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

    // 
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
          // console.log('promise? ', response);
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
          if (listFilter === '' && (userFilter === 'friends' || userFilter === 'strangers')) {
            localStorageService.set('bite' + userFilter, response.data.results);
          }

          return response.data.results;
        },
        function (response) {
          // Error handling here.
          console.log('getSome data error: ', response);
          return {
            error: true,
            errorTxt: response
          };
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
    // console.log('database.getUserListOfLists: getUserListOfLists: userId: ' + userId);

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

  var refreshData = function () {
    // console.log('TODO2 Use refreshData.token', token);
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
          // console.log('db.refreshData data: ', response.data);

          if (checkLogout(response.data) === true) {
            logout();
          } else {
            // console.log('TODO2 Use shc', status, headers, config);
            // console.log('responsedata typeof: ', response.data);
            if (response.data.results && response.data.results[0].success && response.data.results[0].success === '1') {


              return response.data;

            }
            /* TODO2 - Error handling? 
            else {
              console.log('invalid token. Db1488');
              // ', data.results[0].success, data.results[0].success === '1');
            }
            */

          }
        },
        function (response) {
          console.log('response ' + response);
          // Error handling here.
          // TODO2 - Error handling for data refresh error. console.log('checkToken data error: ', response);
        }
      );
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
              localStorageService.remove('listId' + listNameId + viewType);
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
        function (response) {
          if (checkLogout(response.data) === true) {
            logout();
          } else {

            var newListId = response.data.results[0].thingid;
            console.log('new list id created: ' + newListId);
            // Callback - On creating the new list.
            return newListId;

          }
        },
        function (response) {
          console.log('promise error for new list?', response);
        }
      );
    return promise;
  };


  var getMore = function (fromUserId, listId, filter, ignoreTids, moreRecords) {
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
        function (response) {
          if (checkLogout(response.data) === true) {
            logout();
          } else {
            // console.log('db get more response: ', response);
            return response.data;
          }
        },
        function (response) {
          console.log('promise error for new list?');
        }
      );
    return promise;
  };

  return {
    // fbPlittoFriends: fbPlittoFriends,
    /* Added 1/29/2015 */
    getMore: getMore,
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

'use strict';
angular.module('Services.pFb', [])

.factory('pFb', ['$rootScope', 'dbFactory', function ($rootScope, dbFactory) {
  // console.log('logged pFb');
  /* fbAsyncInit - This tracks whether the user is logged in */
  window.fbAsyncInit = function () {
    FB.init({
      appId: '207184820755',
      // appId: '10152399335865756',
      status: true,
      cookie: true,
      xfbml: true,
      version: 'v2.0',
      scope: 'email, user_likes'
    });
  };

  (function (d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = '//connect.facebook.net/en_US/sdk.js';
      fjs.parentNode.insertBefore(js, fjs);
    }
    (document, 'script', 'facebook-jssdk'));

  // Function to update the RootScope from anywhere.
  // REMOVED 1/9/14 var apiPath = (window.cordova) ? 'http://plitto.com/api/2.0/' : '/api/2.0/';
  return {
    getLoginStatus: function () {
      //
      console.log('50. facebook factory getLoginStatus');
      //  return { status: 'test status'};

      // This makes the Facebook API to Facebook. 
      FB.getLoginStatus(function (response) {

        // $rootScope.session.plittoState = 'Facebook Responded 7';
        // console.log('fbFactory.getLoginStatus -> FB.getLoginStatus: This function is only called when requesting the status of the app on login, and when requesting more permissions.', response);
        // $rootScope.loginMessage = 'Facebook needs to grant permissions. Open up the window.;

        $rootScope.$broadcast('getLoginStatus', {
          'fbresponse': null
        });
        // TODO1 - This needs to work. A callback doesn't work with this function. It has to be a broadcast.
        $rootScope.$broadcast('getLoginStatus', {
          'fbresponse': response
        });

        // Update the status
        // $rootScope.session.fbState = response.status;
        // console.log('FB.getLoginStatus | fbState: ', response.status);

        // $rootScope.nav.fb_get_login_status = response.status;
        // console.log('rootScope done broadcasting getLoginStatus {"fbresponse":>???}: ', response);
      });
    },
    login: function () {
      // console.log('Facebook login happening.');
      // TODO2 - As of 11/6/2014, this shouldn't ever be called.
      $rootScope.loginMessage = 'Redirecting you to login with Facebook\'s login process.';
      // OAuth.redirect(); // Should we go straight to oAuth? This doesn't really do anything special.

      FB.login();
      // FB.init();
      // setTimeout(console.log('delay in facebook.login'),2000);
    },
    logout: function () {
      // REMOVED 10/31 $rootScope.session.plittoState = 'Logout Called.';
      // console.log('facebook factory logout');
      // TODO2 - It looks like this isn't working as part of the logout portion. Maybe we don't need it? 11/2014
      FB.logout(function (response) {
        // REMOVED 10/31 $rootScope.session.plittoState = 'Facebook Responded to logout.';
        if (response) {
          $rootScope.$broadcast('fb_logout_succeded');
        } else {
          $rootScope.$broadcast('fb_logout_failed');
        }
      });
    },
    deleteFBaccess: function () {
      console.log('Remove Plitto from Facebook Account');

      $rootScope.token = '';
      dbFactory.dbInit();

      // console.log('facebook factory unsubsubscribe');
      FB.api('/v2.2/me/permissions', 'DELETE', function (response) {
        console.log('Facebook Unsbscribe Plitto Succeeded', response);
        $rootScope.token = null;
        dbFactory.init();
      });
    }
  };
}]);
'use strict';
angular.module('Services.oauth', [])

.service('OAuth', function ($window, $rootScope, $state, $timeout, dbFactory, pltf) {

  // Need to change redirect from plitto.com if on mobile
  // otherwise we're just going to load the entire website on the phone
  //   console.log('window: ', window);
  var redirectUri = '';
  var findPath = document.URL.indexOf('localhost');
  console.log('OAuth service has loaded');
  console.log('findPath: ' + findPath);
  if ( findPath > -1) {

    // TODO2 - This is used for troubleshooting app login. console.log('localhost redirect found', document.URL);
    /* It is running from localhost. If it's also running from window.cordova, then don't bother with the localhost. Else, use the localhost site. */
    // Restore ? var localPath = 'client/';
    var localPath = 'client/test1.html';
    if (document.URL.indexOf(localPath) === -1) {
      // It must be 'client/www'
      localPath = 'client/test2.html';
    }

    // redirectUri = window.cordova ? 'http://plitto.com/CORDOVAWILLCLOSETHISWINDOW' : 'http://localhost/plitto-ionic/' + localPath;
    redirectUri = window.cordova ? 'test3.html' : 'test4.html';

  } else {
    pltf.log('localhost redirect NOT found, which is ok.' + document.URL);
    // redirectUri = window.cordova ? 'http://plitto.com' : 'http://plitto.com/client/';
    redirectUri = window.cordova ? 'test5.html' : 'test6.html';
  }

  // pltf.log('redirect / window.cordova' + redirectUri + window.cordova);

  // Define the auth-window as an element within the whole scope.
  var authWindow = null;

  // This is the only place that controlls the navigation based on the token's presence.
  $rootScope.$watch('token', function () {

    // $rootScope.debug('oauth13: rootScope token changed: ' + $rootScope.token);
    // If token is loading, go to loading screen.
    if (typeof ($rootScope.token) === 'string' && $rootScope.token === 'loading') {
      // $state.go('loading');
      $rootScope.$broadcast('broadcast', {
        command: 'state',
        path: 'loading',
        debug: 'oauth.25 token is "loading". Go there.'
      });
    } else if (typeof ($rootScope.token) === 'string' && $rootScope.token.length > 0) {
      // We will assume that the token is valid TODO1 - Test it.
      $rootScope.$broadcast(
        'broadcast', {
          command: 'state',
          path: 'app.home',
          debug: 'oauth.43 untested token. Assumed to be good. go to app.home suggested through broadcast: app.home .'
        }
      );

      // $location.path('/login');
    } else {
      // TODO1 Add some more logic to this. $state.go("login");
      // If there is an access token, we can just wait.
      if (window.location.hash.indexOf('access_token') !== -1) {
        // console.log('Found an access token.', window.location.hash);
        // This is the bit that stops things while 
        console.log('oauth67 - found access_token');
        $rootScope.$broadcast('broadcast', {
          command: 'login',
          platform: 'facebookFinishLogin',
          tokenHash: window.location.hash,
          debug: 'Controllers.js 210. OAuth.login'
        });
        // Go back to loading?
        $state.go('loading');
        // console.log('wait');
      } else {

        console.log('oauth78 - no found access_token');

        $rootScope.$broadcast('broadcast', {
          command: 'state',
          path: 'login',
          debug: 'oauth.33 No token. Login.'
        });
      }
    }
  });

  // Function that is called with auth code and redirect home
  /* */
  var authFinished = function (fbToken) {
    // console.log('Got this code: ' + fbToken);
    // console.log('Now what? Think a post to plitto.com has to happen');

    // $rootScope.loginMessage = $rootScope.loginMessage + ' authFinishedCode: ' + code;
    // Turn the fbToken into the plitto login.
    dbFactory.fbTokenLogin(fbToken);

    // Close the auth window?
    // console.log('authFinished wants to close authWindow because the login is complete.', authWindow);

    // Close the window
    authWindow.close();
  };

  function getParameterByName(name, path) {
    var bettername = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + bettername + '=([^&#]*)'),
      results = regex.exec(path);
    // console.log('getParameterByName: name: ', name, ' bettername: ', bettername, ' path: ', path);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }

  // Event handler for the inAppBrowser plugin's `loadstart` event
  var loadstart = function (e) {
    $rootScope.loginMessage = '6. Loadstart Started';
    //console.log('6. Loadstart started');
    // console.log('this is the authwindow: ', authWindow);


    // console.log('e.url loadstart', e.url);
    // TODO1: HANDLE ERROR (if user denies access)
    // Form: error=access_denied&error_code=200&error_description=Permissions+error&error_reason=user_denied

    // Let's strip out the pound sign. 
    var fburlpath = e.url.replace('#', '');

    var accessToken = getParameterByName('access_token', fburlpath);

    var fbError = getParameterByName('error', fburlpath);

    // The above should sniff the presense of an access token.

    if (accessToken || fbError) {
      // $rootScope.loginMessage = '7. Loadstart Code: ' +  accessToken;
      // console.log('7. loadstart found a code');
      //console.log('7. loadstart code: ' + accessToken);
      // authWindow.close(); // do this inside authFinished code.
      authFinished(accessToken);

      $timeout(function () {
        // 
        authWindow.close();
        console.log('Facebook timed out.');
        // TODO1 - Line deactivated on 1/13/2015 authFinished(accessToken);
      }, 3000);
    } else {
      console.log('loadstart debug 72. No accessToken or error');
    }
  };

  this.deleteFBaccess = function () {
    console.log('oauth deleteFBaccess. TODO3');
  };

  /* called by initial login */
  this.login = function (oauthService) {
    if (oauthService === 'facebook') {
      console.log('oauth facebook');
      $rootScope.loginMessage = '3. OAuth.login.Facebook (oauth.101) Opened. Next: Initiate FB.';

      /* Cordova App: All Facebook Info gets routed through a window. */
      var authUrl = '';
      //       console.log('oauth.js login() : window.cordova? ', window);

      if (window.cordova) {
        /* Native App Redirect to localhost */
        authUrl = 'https://www.facebook.com/v2.0/dialog/oauth?' +
          'client_id=207184820755x' +


          // '&redirect_uri=' + redirectUri + // This is irrelevant, because the window should close as soon as the code is received.
          '&redirect_uri=http://plitto.com/test6.html' +  + // This is irrelevant, because the window should close as soon as the code is received.
          '&display=touch' +
          '&scope=email,user_friends' +
          '&response_type=token';
        // var authWindow = null;
        $rootScope.loginMessage = '4. This is the local app version.';

        /* This opens the Facebook Authorization in a new window */

        authWindow = $window.open(authUrl, '_blank', 'location=no,toolbar=no');
        // console.log('111authWindow: open this URL: ', authUrl);
        authWindow.addEventListener('loadstart', loadstart);

      } else {
        // This is for the web. For whatever reason, the FB. bit doesn't work in the cordova version.
        authUrl = 'https://www.facebook.com/v2.0/dialog/oauth?' +
          'client_id=207184820755' +
          // '&redirect_uri=' + redirectUri + // This is irrelevant, because the window should close as soon as the code is received.
          '&redirect_uri=http://plitto.com/test4.html' +
          '&display=touch' +
          '&scope=email,user_friends' +
          '&response_type=token';

        // var authWindow = null;
        $rootScope.loginMessage = '4. Directing to FB for web authorization';

        // https://www.facebook.com/v2.0/dialog/oauth?client_id={app-id}&redirect_uri={redirectUri} 
        // console.log('go here: ', authUrl);

        // Redirect to Facebook for authorization
        $rootScope.$broadcast('broadcast', {
          command: 'redirect',
          path: authUrl,
          debug: 'oauth.js 160 - Redirect to Facebook for oauth.'
        });

        /* Check with Facebook to get this user's login status */
      }
    } else {
      $rootScope.loginMessage = 'END 5.1. Unknown Service Requested';
    }
  };

  // Set the API path for the mobile app, and localhost:
  // 
  // var apiPath = (window.cordova) ? 'http://plitto.com/api/2.0/' : '/api/2.0/'; // TODO2 - This is never used. OK?

});

'use strict';
angular.module('pRun', [])
  .run(function ($ionicPlatform, $rootScope, dbFactory, OAuth, $state, pltf, localStorageService, $location, pFb) {
    /* Deleted 1/28/2015. Works without it. 1/29/2015 - MAYBE NOT!
     */
    // Check to see if Facebook is giving us a code to use in the URL.
    if (pltf.QueryString.code) {
      // Make the Plitto API call
      //console.log('RUN URL because we found it.', pltf.QueryString.code);
      // TODO1 - Put this backdbFactory.fbTokenLogin(pltf.QueryString.code);
    }

    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      console.log('What is cordova window? ' + window.cordova);
      if (window.cordova && window.cordova.plugins.Keyboard) {
        console.log('found the window.');
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
      // Get the access token from Facebook. TODO1 - 12/20 - It looks like something is intercepting it, and removing it.
      //console.log('ionicPlatform.run: access_token location: ', window.location.hash.indexOf('access_token'));
      if (window.location.hash.indexOf('access_token') !== -1) {
        /* Debug 1/27/2015 REMOVED Batch 3
        //console.log('ionicPlatform.run: Found the token.',
          window.location.hash,
          window.location.hash.indexOf('access_token')
        );
        // TODO2UX - Show a loading indicator
        */
        var hash = window.location.hash;

        // Show loading.
        $state.go('loading');

        var fbAccessToken = hash.substring(hash.indexOf('access_token=') + 'access_token='.length, hash.indexOf('&'));
        //console.log('app118 at: ' + fbAccessToken);

        $rootScope.loginMessage = 'Facebook Access Granted. Logging into Plitto now.';
        //  + fbAccessToken

        // Use this to make the call to login.
        dbFactory.fbTokenLogin(fbAccessToken);
      }


    });


    /* disabled 1/19/2015
    var headerTitle = function() {
      //console.log('HeaderTitle');
      return 'Title from Function';
    };
    */

    /* Control all the login and redirect functions */
    $rootScope.$on('broadcast', function (event, args) {
      // console.log('heard command');

      if (typeof args.debug === 'string') {
        // console.log('args.debug: '"', args.debug);
      }

      // console.log('command event: ', event, 'args: ', args, args.debug);

      // console.log("Debug message: ", args.debug);

      if (args.command === 'login') {
        if (args.platform === 'facebook') {
          // 
          console.log('login with facebook');
          //
          // 5/4
          restore OAuth.login('facebook');
          // pFb.login();
        } else if (args.platform === 'facebookFinishLogin') {
          // console.log('finsh fb login', event, args, 'tokenhash?', args.tokenHash);
          // Process the token hash. 
          var theToken = args.tokenHash.replace('#/access_token=', ''); // First character should be the beginning of the token.
          theToken = theToken.substring(0, theToken.indexOf('expires_in') - 1);

          // console.log("TOKEN TO PROCESS: ", theToken);
          $rootScope.loginMessage = 'Facebook Token received. Generating Plitto Login';
          // 5/4
          dbFactory.fbTokenLogin(theToken);
        }
      } else if (args.command === 'redirect') {
        // 
        // console.log('args.redirect, REDIRECT controllers.47 args.path:  ', args.path);
        // 
        pltf.plainJsRedirect(args.path); /* Global function in functions.js */

      }

      /* This is used to navigate around the app */
      else if (args.command === 'state') {
        // console.log('controllers.js 31 $state.go, args.path: ', args.path);
        // TODO1 - This is not working for the loading page.
        // TODO1 - Restore this . 
        // console.log('controller.js58 state.go: ', args.path);
        $state.go(args.path);

        // $state.go("app.home");
        // $state.go("app.debug");
      } else if (args.command === 'deleteFBaccess') {
        // console.log('Delete from FB');
        pFb.deleteFBaccess();
      }
    });

    // TODO1 - The below should be triggered as part of the callback.
    var initCallback = function () {
      // console.log('controller.js initCallback made.');
      if (!$rootScope.token || $rootScope.token === null) {
        // See if it's in the local storage.
        $rootScope.loginMessage = 'Looking for token in local storage.';
        // Check for Active Token on load
        if (localStorageService.get('token')) {
          $rootScope.loginMessage = 'Token Found';
          // console.log('There was a token in the local storage.');
          // conole.log('BUT IS IT VALID?!?!?!? TODO1 - Only apply the token if it\'s a valid one.');
          // Set the token.
          $rootScope.token = localStorageService.get('token');

          // This should only happen when the app loads, and at specific times, so we'll build everything back up in dbFactory
          $rootScope.loginMessage = 'use dbFactory.refreshData to check if the token is valid.';

          dbFactory.refreshData($rootScope.token).then(function (d) {
            // TODO2 REMOVE This if it's not being used.
            // console.log('controller.initCallback 88 --> refreshData response: ', d);
          });

        } else if (
          window.location.hash.indexOf('access_token') !== 'undefined' &&
          window.location.hash.indexOf('access_token') !== -1
        ) {
          console.log('Access Token: Querystring? ' +
            window.location.hash.indexOf('access_token'),
            ',  QueryString.access_token '
          );
        } else {

          // console.log('No token in local storage.');

          // $location.path('/login');
          $rootScope.loginMessage = 'There is no token in local storage. Redirect to login page.';
          $location.path('/login');

          // Only do this if there isn't an auth_token in the URL.

          $state.go('login');
          /* Removed 1/28 
          $rootScope.$broadcast('broadcast', {
            command: 'state',
            path: 'login',
            debug: 'controllers.js 127. No token in local storage at the loading screen.'
          });
          */
        }
      }
    };

    // The first function of the app is initializing it the database.
    dbFactory.dbInit(initCallback);

    // Global 
    $rootScope.debug = function (message) {

      if (typeof ($rootScope.loginMessage) === 'string' && $rootScope.loginMessage.length > 255) {
        $rootScope.loginMessage = 'Login cleared';
      }

      if ($rootScope.debugOn === true) {
        if (typeof (message) === 'string') {
          // console.log(message);
          $rootScope.loginMessage = $rootScope.loginMessage + ' | ' + message;
        } else {
          console.log('message is not a string', message);
        }
      }
    };


    /* Control all the login and redirect functions */
    $rootScope.$on('broadcast', function (event, args) {
      // console.log('heard command');

      if (typeof args.debug === 'string') {
        // console.log('args.debug: '"', args.debug);
      }

      // console.log('command event: ', event, 'args: ', args, args.debug);

      // console.log("Debug message: ", args.debug);

      if (args.command === 'login') {
        if (args.platform === 'facebook') {
          // console.log('login with facebook');
          // 
          OAuth.login('facebook');
          // pFb.login();
        } else if (args.platform === 'facebookFinishLogin') {
          // console.log('finsh fb login', event, args, 'tokenhash?', args.tokenHash);
          // Process the token hash. 
          var theToken = args.tokenHash.replace('#/access_token=', ''); // First character should be the beginning of the token.
          theToken = theToken.substring(0, theToken.indexOf('expires_in') - 1);

          // console.log("TOKEN TO PROCESS: ", theToken);
          $rootScope.loginMessage = 'Facebook Token received. Generating Plitto Login';
          dbFactory.fbTokenLogin(theToken);
        }
      } else if (args.command === 'redirect') {
        // 
        // console.log('args.redirect, REDIRECT controllers.47 args.path:  ', args.path);
        // 
        pltf.plainJsRedirect(args.path); /* Global function in functions.js */

      }

      /* This is used to navigate around the app */
      else if (args.command === 'state') {
        // console.log('controllers.js 31 $state.go, args.path: ', args.path);
        // TODO1 - This is not working for the loading page.
        // TODO1 - Restore this . 
        // console.log('controller.js58 state.go: ', args.path);
        $state.go(args.path);

        // $state.go("app.home");
        // $state.go("app.debug");
      } else if (args.command === 'deleteFBaccess') {
        // console.log('Delete from FB');
        pFb.deleteFBaccess();
      }
    });


    // TODO1 - The below should be triggered as part of the callback.
    var initCallback = function () {
      // console.log('controller.js initCallback made.');
      if (!$rootScope.token || $rootScope.token === null) {
        // See if it's in the local storage.
        $rootScope.loginMessage = 'Looking for token in local storage.';
        // Check for Active Token on load
        if (localStorageService.get('token')) {
          $rootScope.loginMessage = 'Token Found';
          // console.log('There was a token in the local storage.');
          // conole.log('BUT IS IT VALID?!?!?!? TODO1 - Only apply the token if it\'s a valid one.');
          // Set the token.
          $rootScope.token = localStorageService.get('token');

          // This should only happen when the app loads, and at specific times, so we'll build everything back up in dbFactory
          $rootScope.loginMessage = 'use dbFactory.refreshData to check if the token is valid.';
          /*
          dbFactory.refreshData($rootScope.token).then(function (d) {
            // console.log('controller.initCallback 88 --> refreshData response: ', d);
          });
          /*
        } else if (
          window.location.hash.indexOf('access_token') !== 'undefined' &&
          window.location.hash.indexOf('access_token') !== -1
        ) {
          console.log('Access Token: Querystring? ' +
            window.location.hash.indexOf('access_token'),
            ',  QueryString.access_token '
          );
        } else {

          // console.log('No token in local storage.');

          // $location.path('/login');
          $rootScope.loginMessage = 'There is no token in local storage. Redirect to login page.';
          $location.path('/login');

          // Only do this if there isn't an auth_token in the URL.

          $state.go('login');
          /* Removed 1/28 
          $rootScope.$broadcast('broadcast', {
            command: 'state',
            path: 'login',
            debug: 'controllers.js 127. No token in local storage at the loading screen.'
          });
          */
        }
      }
    };


    // The first function of the app is initializing it the database.
    dbFactory.dbInit(initCallback);

    // Global 
    $rootScope.debug = function (message) {

      if (typeof ($rootScope.loginMessage) === 'string' && $rootScope.loginMessage.length > 255) {
        $rootScope.loginMessage = 'Login cleared';
      }

      if ($rootScope.debugOn === true) {
        if (typeof (message) === 'string') {
          // console.log(message);
          $rootScope.loginMessage = $rootScope.loginMessage + ' | ' + message;
        } else {
          console.log('message is not a string', message);
        }
      }
    };

  });

'use strict';
angular.module('pConstant', [])

.constant('angularMomentConfig', {
    timezone: 'Europe/London' // America/Chicago America/Los_Angeles America/New_York
  })
  /* Config Defaults */
  .constant('pltf', {
    // Returns seconds to offset the time by for moment 
    'tz': new Date().getTimezoneOffset(),
    'domSize': function (output) {
      if (output === 'console') {
        //console.log('HTMLString', $(document.body).html().length);
      } else if (output === 'return') {
        return $(document.body).html().length;
      }

    },
    'log': function (toLog) {

      // turned debug off. 
      // 

      //console.log(toLog);
    },
    'QueryString': function () {

      //console.log('70 NO NEED FOR THIS QUERYSTRING FUNCTION???');

      // This function is anonymous, is executed immediately and 
      // the return value is assigned to QueryString!
      var returnString = {};
      var query = window.location.search.substring(1);
      var vars = query.split('&');
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        // If first entry with this name
        if (typeof returnString[pair[0]] === 'undefined') {
          returnString[pair[0]] = pair[1];
          // If second entry with this name
        } else if (typeof returnString[pair[0]] === 'string') {
          var arr = [returnString[pair[0]], pair[1]];
          returnString[pair[0]] = arr;
          // If third or later entry with this name
        } else {
          returnString[pair[0]].push(pair[1]);
        }
      }
      return returnString;
    },
    'plainJsRedirect': function (url) {

      //console.log('plainJsRedirect: ', url);
      // window.location.href = url;
      // window.location.assign(url);
      setTimeout(function () {
        location.href = url;
      }, 5000);

    },
    'randNum': function (maxNum) {

      return Math.floor((Math.random() * maxNum) + 1);
    }
  });
'use strict';
angular.module('viewConfig', [])
  .config(function ($stateProvider, $urlRouterProvider, $httpProvider, $ionicConfigProvider, pltf) {
    // This sets the number of times that it stores prior pages in the dom.
    $ionicConfigProvider.views.maxCache(1);

    $stateProvider.state('app.home', {
      url: '/home',
      views: {
        'menuContent': {
          templateUrl: 'templates/home.html',
          controller: 'HomeCtrl'
        }
      }
    })

    .state('app', {
      url: '',
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'AppCtrl'
    })

    .state('app.user', {
      url: '/u/:userId',
      views: {
        // Menu is required for left menu.
        'menuContent': {
          templateUrl: 'directives/user.html',
          controller: 'UserCtrl'
        }
      }
    })

    .state('app.thing', {
      url: '/t/:thingId',
      views: {
        'menuContent': {
          templateUrl: 'directives/thing.html',
          controller: 'ThingCtrl'
        }
      }
    })

    .state('app.list', {
      url: '/l/:listId',
      views: {
        'menuContent': {
          templateUrl: 'directives/list.html',
          controller: 'ListCtrl'
        }
      }
    })

    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl'
    })

    /* FOR BACK END OAUTH. PLEASE LEAVE THIS HERE
    .state('authCallback', {
      url: '/login/callback?access_token&userId',
      templateUrl: 'templates/login-callback.html',
      controller: 'LoginCallbackCtrl'
    })*/

    .state('loading', {
      url: '/loading',
      templateUrl: 'templates/loading.html',
      controller: 'LoadingCtrl'
    })

    .state('app.search', {
      url: '/search',
      views: {
        'menuContent': {
          templateUrl: 'templates/search.html',
          controller: 'SearchCtrl'
        }
      }
    })

    .state('app.about', {
      url: '/about',
      views: {
        'menuContent': {
          templateUrl: 'templates/about.html',
          controller: 'DocsCtrl'
        }
      }
    })

    .state('app.docs', {
      url: '/docs',
      views: {
        'menuContent': {
          templateUrl: 'templates/docs.html',
          controller: 'DocsCtrl'
        }
      }
    })

    .state('app.feed', {
      url: '/feed',
      views: {
        'menuContent': {
          templateUrl: 'templates/feed.html',
          controller: 'FeedCtrl'
        }
      }
    })

    .state('app.friends', {
      url: '/friends',
      views: {
        'menuContent': {
          templateUrl: 'templates/friends.html',
          controller: 'FriendsCtrl'
        }
      }
    })

    .state('app.chat', {
      url: '/chat',
      views: {
        'menuContent': {
          templateUrl: 'templates/chat.html',
          controller: 'chatCtrl'
        }
      }
    })

    .state('app.debug', {
      url: '/debug',
      views: {
        'menuContent': {
          templateUrl: 'templates/debug.html',
          controller: 'DebugCtrl'
        }
      }
    })

    .state('app.addlist', {
      url: '/addlist',
      views: {
        'menuContent': {
          templateUrl: 'templates/add-list.html',
          controller: 'addListCtrl'
        }
      }
    })

    .state('app.lists', {
      url: '/lists',
      views: {
        'menuContent': {
          templateUrl: 'templates/lists.html',
          controller: 'ListsCtrl'
        }
      }
    });

    $urlRouterProvider.otherwise('/home'); // Added 12.19.2014


    // if none of the above states are matched, use this as the fallback
    // TODO1 - Do this. $urlRouterProvider.otherwise('/app/home');
    //console.log('QUERYSTRING ACCESS TOKEN: ', pltf.Querystring('TESTSTRING'));
    /* Removed 1/29/2015 Ok for troubleshooting? */
    if (pltf.QueryString('access_token') || window.location.hash.indexOf('access_token') > -1) {
      //console.log('found querystring access token.' + pltf.QueryString('access_token'));

    }
    /* TODO2 - handle the error handling 
    else {

        //console.log('No access token. Let the user log in.', 'access_token: ');
        //console.log(pltf.QueryString('access_token') + 'Location hash: ' + window.location.hash);
        // $urlRouterProvider.otherwise('/app/home');
        //console.log("REPLACeD", window.location.hash.replace("#/",""));

        //http://localhost/plitto-ionic/client/app/?#/access_token=CAAAAMD0tehMBAMUwibZCHQrzYS3v6QdLKTsIlWveB7CTSV0ZByuItJP8u7tF3xaYjGBNjeT7BDRjVWA9WwwelEjMAZCiKgi9C5dDIAUfZAUwdqPQlxxDbykoslmJs8OhyNRpXEoU0o6fC2eiYMROqOLvW8C1A0NU72YBmgcWitSom8Yw0rdEQCLktU6t1xdePnNKLLq75dlANujWVRvgcsgIuZCjZAZC9IZD&expires_in=6952

        // TODO1 - Put this back $urlRouterProvider.otherwise('/app/home');
      }
      */


    // Handle 401 Unauthorized responses
    $httpProvider.interceptors.push(
      function ($q, $location) {
        return {
          responseError: function (rejection) {
            if (rejection.status === 401) {
              $location.path('/login');
            }
            return $q.reject(rejection);
          }
        };
      }
    );

  });
'use strict';
angular.module('userListThingController', [])
  .directive('userListThing', function (dbFactory, $state) {

    return {
      restrict: 'E',
      templateUrl: 'directives/userListThing.html',
      scope: {
        store: '@store',
        source: '@source',
        userData: '=userData'
      },
      controller: function ($scope, dbFactory) {

        /* Ditto */
        $scope.ditto = function (mykey, uid, lid, tid, itemKey) {

          var arrPair = [];

          // Traverse this user's lists to find the existing item.
          for (var i = 0; i < $scope.userData.lists.length; i++) {
            // console.log('e33', $scope.userData.lists[i], parseInt(lid), parseInt($scope.userData.lists[i].lid));
            if (parseInt(lid) === parseInt($scope.userData.lists[i].lid)) {
              //console.log('list matches. g35');
              for (var j = 0; j < $scope.userData.lists[i].items.length; j++) {
                //console.log('check 426: ',$scope.userData.lists[i].items[j].tid, tid);
                if (parseInt($scope.userData.lists[i].items[j].tid) === parseInt(tid)) {

                  $scope.userData.lists[i].items[j].mykey = 0;
                  $scope.userData.lists[i].items[j].friendsWith = '?'; // This makes it go to a question mark.

                  /* Log the position in the array that will be used to update */
                  arrPair.push(new Array(i, j));
                }
              }
            }
          }
          /* else { 
console.log(' list no match: ', parseInt(lid), parseInt($scope.userData.lists[i].lid));
} * /
          };

          /* The elements are [0] - mykey / null , [1]:[friendsWith] / undefined - [2]['ditto'/'remove'] */
          dbFactory.promiseDitto(mykey, uid, lid, tid, itemKey).then(
            function (d) {
              for (var k = 0; k < arrPair.length; k++) {
                // console.log('d', d[0], d[1]);
                // console.log('c', k, d, String(d[0]));
                // console.log('B ', $scope.userData.lists[arrPair[k][0]]);
                // console.log('A ', $scope.userData.lists[arrPair[k][0]].items[arrPair[k][1]]);
                if (parseInt(d[0])) {
                  // Apply my item's key
                  $scope.userData.lists[arrPair[k][0]].items[arrPair[k][1]].mykey = String(d[0]);
                } else {
                  // Set my key to null, because I don't have it any more.
                  $scope.userData.lists[arrPair[k][0]].items[arrPair[k][1]].mykey = null;
                }

                // Apply the count of my friends with this item.
                if (parseInt(d[1])) {
                  $scope.userData.lists[arrPair[k][0]].items[arrPair[k][1]].friendsWith = '+' + d[1];
                } else {
                  $scope.userData.lists[arrPair[k][0]].items[arrPair[k][1]].friendsWith = '';
                }
              }
            }
          );
        };

        /* User */
        $scope.showUser = function (userId, userName, fbuid) {
          if (parseInt(userId) !== 0) {
            $state.go('app.user', {
              userId: userId,
              userName: userName,
              fbuid: fbuid
            });

            $scope.userData = [];
          }
        };

        /* List */
        $scope.showList = function (listId, listName, userFilter) {
          // TODO - Fix this. dbFactory.showAList(listId, listName, userFilter, focusTarget);
          console.log('Use userFilter later ' + userFilter);
          $state.go('app.list', {
            listId: listId,
            listName: listName
          });
          $scope.userData = [];
        };

        /* Thing */
        $scope.showThing = function (thingId, thingName, userFilter) {
          console.log('Use userFilter later ' + userFilter);
          $state.go('app.thing', {
            thingId: thingId,
            thingName: thingName
          });
          $scope.userData = [];

          // dbFactory.showThing(thingId, thingName, userFilter);
        };

        /* Let's Chat
        letsChat(userData.uid, list.lid, item.tid, item.ik, $event); " 
        TODO2 - Remove $index and $event.
        */
        $scope.letsChat = function (uid, lid, tid, itemKey, $event) {
          //console.log('letsChat app.js directive', uid, lid, tid, itemKey, $event );
          // Find the item in this list.
          var i = 0,
            j = 0;

          loop1:
          for (i in $scope.userData.lists) {
            if (lid === $scope.userData.lists[i].lid) {
              j = 0;
              loop2:
              for (j in $scope.userData.lists[i].items) {
                if ($scope.userData.lists[i].items[j].ik === itemKey) {
                  break loop1;
                }
              }
            }
          }

          //console.log('vars: i,j',i,j);

          var isActive = 1;
          if ($($event.target).hasClass('active')) {
            // User is removing this from their chat queue.
            isActive = 0;
            $($event.target).removeClass('active');
            $('div#comments' + uid + lid + tid).hide();
            $scope.userData.lists[i].items[j].commentActive = null;
          } else {

            $($event.target).addClass('active');
            $('div#comments' + uid + lid + tid).show();
            $scope.userData.lists[i].items[j].commentActive = '1';

          }
          // Call the addComment bit to activate or deactivate the queue item
          dbFactory.promiseAddComment(uid, lid, tid, itemKey, '0', isActive).then(function (d) {
            // NO FEEDBACK ON ADD COMMENT? 
            console.log('Do something with d ' + d);
          });
        };

        $scope.makeItemComment = function (newComment, uid, lid, tid, itemKey) {
          //console.log('makeItemComment', newComment, uid, lid, tid, itemKey);
          // Find the user, then the list, then use the index.


          // Find the item in this list.
          var i = 0, j = 0;
          loop1:
          for (i in $scope.userData.lists) {
            if (lid === $scope.userData.lists[i].lid) {
              j = 0;
              loop2:
              for (j in $scope.userData.lists[i].items) {
                if ($scope.userData.lists[i].items[j].ik === itemKey) {
                  break loop1;
                }
              }
            }
          }

          //console.log('vars: i,j', i, j);
          $scope.userData.lists[i].items[j].commentText = newComment;

          // submit it to the database
          // 
          dbFactory.promiseAddComment(uid, lid, tid, itemKey, newComment, '1').then(function (d) {
            //console.log('ult521 add comment');
            console.log('Do something with d ' + d );
          });

          // TODO1 Clear the comment field

        };

        // moreOfThis( list.lid );
        $scope.moreOfThis = function (lid) {
          //console.log('app.ult.moreOfThis: ,  lid: ', lid, ' userData: ', $scope.userData, $scope.userData.lists.length);
          // Note: A null userId is required to get content from a user and their contacts. A 0 will return strangers.

          // Track the final list position in userData. 
          var finalJ = null;
          //console.log('ud lengthL '+ $scope.userData.length);
          // Create something to hold items.
          var listTids = [];

          // Find this list position.
          for (var j = 0; j < $scope.userData.lists.length; j++) {
            //  //console.log('app.ult.moreofthis lidTEST', $scope.userData.lists[j].lid, lid);
            if ($scope.userData.lists[j].lid === lid) {
              finalJ = j;
              //console.log('j, finalj', j, finalJ);

              for (var i = 0; i < $scope.userData.lists[j].items.length; i++) {
                // itemIds.push = $scope.userData.lists[j].items[i].ik;\
                listTids.push($scope.userData.lists[j].items[i].tid);
                ////console.log('app.ult.moreofthis $scope.userData.lists[j].items[i]' , $scope.userData.lists[j].items[i].ik );
              }
              // Set i, j to 1000 to end the loop. 
              finalJ = j;
              i = 1000;
              j = 1000;
              //console.log("END THE LOOP!");
            }
          }
          // Ask for 10 more items, for now by setting this button's value to 'loading'
          // console.log('Scope.userdata.',$scope.userData.lists[0],'final j: ',finalJ);
          $scope.userData.lists[finalJ].showMore = '0';

          // User Id, List Id, filter: 'all' future: ditto, shared, tids, limit 
          dbFactory.getMore($scope.userData.uid, lid, 'all', listTids, 10).then(function (d) {
            // We only need the user's items. It will be just one user, and just this list, which we know where it is thanks to the i variable above. 

            if (!d.results.length) {
              // We ran out of more items!
              $scope.userData.lists[finalJ].showMore = false;
            } else {
              // We have results. Merge them.

              $scope.userData.lists[finalJ].items = $scope.userData.lists[finalJ].items.concat(d.results[0].lists[0].items);

              /*
              for(var i = 0; i < d.results[0].lists[0].items.length; i++){
                //console.log('d.results[0].lists[0].items[i]', d.results[0].lists[0].items[i]);
                // $scope.userData.lists[finalJ].items.splice(0, 0, d.results[0].lists[0].items[i]);
                $scope.userData.lists[finalJ].items.push(d.results[0].lists[0].items[i]);
              } */

              //console.log('new userdata', $scope.userData);


              $scope.userData.lists[finalJ].showMore = d.isMore;
              //
              // console.log('showMore: ', d.isMore);
            }

          });
        };

      }
    };

  });

'use strict';
angular.module('userNavDirective', [])
  .directive('userNav', function () {
    return {
      restrict: 'E',
      // // templateUrl: 'directives/userNav.html', // Not rendering.


      template: '<ion-nav-bar class="bar-stable plittoBar">' +
        '<ion-nav-back-button></ion-nav-back-button>' +
        '<ion-nav-buttons side="left">' +

        '<button menu-toggle="left" class="button button-icon icon ion-navicon"></button>' +
        '</ion-nav-buttons>' +
        '<ion-nav-buttons side="secondary" class="navSecond">' +
        '{{domLengthNum}}' +
        '<a ng-click="domLength();" class="button button-icon ionicons ion-help-buoy"></a> ' +
        '<a href="#/addlist" class="button button-icon ionicons ion-plus-circled"></a> ' +
        '<a href="#/home" class="button button-icon ion-ios7-checkmark-outline"></a> ' +
        '<a href="#/search" class="button button-icon ion-search"></a> ' +
        '</button>' +
        '</ion-nav-buttons>' +
        '</ion-nav-bar>',
      /* */

      /*
            template: '<div class="bar bar-header">' +
              '<div class="h1 title">Header Buttons</div>' +
              '<button class="button icon ion-navicon></button>' +
              '</div>',
      

      template: '<ion-nav-bar align-title="left" >' +
        '<div class="buttons"><button class="button ionicon ion-nav">LEFT</button></div>' +


        '</ion-nav-bar>',
        */

      controller: function ($scope) {
        $scope.domLengthNum = null;
        $scope.domLength = function () {
          $scope.domLengthNum = $(document.body).html().length;
        };
      }

    };
  }
);

'use strict';
/* Profile Directive / Controller */
angular.module('userDirective', []).directive('user', function () {

  return {
    restrict: 'E',
    template: 'directives/user.html',
    controller: 'UserCtrl',
    controllerAs: 'ctrl'
  };
});
'use strict';
angular.module('chatDirective', []).directive('chat',
  function () {
    return {
      restrict: 'E',
      templateUrl: 'directives/chat.html',

      scope: {
        notificationsData: '=notificationsData'
      },
      controller: function ($scope) {
        // Debug
        $scope.changeFilter = function (filterNew) {
          //console.log('TEST', filterNew);
          $scope.filterChat = filterNew;
        };

        // $scope.filterChatOptions = [ { filter: "them", selected: true }, { filter: "us", selected: false }, { filter: "me", selected: false } ];
        $scope.filterChatOptions = [{
          show: 'Them',
          value: 'them'
        }, {
          show: 'Us',
          value: 'us'
        }, {
          show: 'Me',
          value: 'me'
        }];
        $scope.filterChat = $scope.filterChatOptions[0];
      }
    };
  }
);
'use strict';
angular.module('listOfListsDirective', [])
  .directive('listOfLists', function ($rootScope, dbFactory, $state, localStorageService) {
    return {
      restrict: 'E',
      templateUrl: 'directives/listOfLists.html',

      scope: {
        store: '@store',
        source: '@source',
        listsData: '=listsData'
      },
      controller: function ($scope, dbFactory, $state) {
        // First, load the lists.
        //console.log('listoflists: ', $scope);
        if (localStorageService.get('user' + $rootScope.user.userId + 'lists')) {
          $scope.listsData = localStorageService.get('user' + $rootScope.user.userId + 'lists');
        }
        // Now, call for this the local user's lists to be populated.
        dbFactory.promiseListOfLists($rootScope.user.userId).then(function (d) {
          $scope.listsData = d;
          //console.log('my lists?', $rootScope.user.userId, d);
        });

        /* Link to List */
        $scope.showList = function (listId, listName, userFilter, focusTarget) {
          $state.go('app.list', {
            listId: listId,
            listName: listName
          });

          // dbFactory.showAList(listId, listName, userFilter, focusTarget);
        };
      }
    };
  });
'use strict';
angular.module('appController', [])
  // REMOVED Facebook from the injectors // 13 - ionicNavBarDelegate - 14 - $ionicHistory
  .controller(
    'AppCtrl',
    function ($scope, $state, dbFactory, $rootScope, localStorageService) {

      // On load, load the correct interface, based on the token.

      // console.log('AppCtrl.load: Token: ' + $rootScope.token);
      // Execute the check for the token in the RootScope on load.

      if (typeof ($rootScope.token) === 'string' && $rootScope.token === 'loading') {
        // console.log('initial: loading');

        $state.go('loading');
      } else if (typeof ($rootScope.token) === 'string' && $rootScope.token.length > 0) {
        // We will assume that the token is valid TODO1 - Test it.
        // $rootScope.debug('Appctrl - 183 Loading because the token looks good.');
        // $state.go('app.home'); // TODO1 - Diego - Should this be moved? - Not working!

        if (typeof $rootScope.token === 'string' && $rootScope.token !== 'loading') {
          // Only when it's loading or home.
          if ($state.current.name === 'login' || $state.current.name === 'loading') {
            $state.go('app.home');

          }
          // TODO2 -  Test this. 
        }
        // TODO2 - Update someday? dbFactory.updateCounts();

        // TODO1 - Check this, or will that happen when requesting the first call?
        //     $ionicHistory.clearHistory();
        // $location.path('/login');
      } else {
        // console.log('initial: null?');
        $rootScope.loginMessage = 'Checking for null token.';
        // TODO1 When would this be done? $state.go("login");
      }

      $scope.deleteFBaccess = function () {
        // console.log('deleteFBaccess in loginctrl TODO1 ');
        $rootScope.$broadcast('broadcast', {
          command: 'deleteFBaccess',
          debug: 'Delete from FB'
        });
        // TODO1 Restore this: Facebook.unsubscribe();
      };

      // Grab the user info here as soon as they login.

      $scope.login = function () {
        $rootScope.$broadcast('broadcast', {
          command: 'login',
          platform: 'facebook',
          debug: 'Controllers.js 210. OAuth.login'
        });
      };

      // Global Logout Handler - TODO2 - This was added to functions.js and should be removed from here.
      $scope.logout = function () {
        // TODO: Make database service call.
        // console.log('logout');

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



    })

;

'use strict';
angular.module('searchController', [])
  .controller('SearchCtrl', function ($scope, $stateParams, dbFactory, $state) {

    /* Clear out the last search */
    $scope.search = {
      term: $stateParams.term,
      results: []
    };

    /* Clear the Search */
    $scope.emptyTheSearch = function () {
      // console.log('clear Search');
      $scope.search = {
        term: null,
        results: []
      };
      var elementToFocusOn = document.querySelector('input#searchField');
      // TODO2 - Focus on search in app on click. console.log('focus on: ', elementToFocusOn);
    };

    $scope.searchFor = function (searchTerm, searchType) {
      // console.log('this could be deleted. The whole function. 1/27/2015');
    };

    /* List */
    $scope.showList = function (listId, listName, userFilter, focusTarget) {
      // console.log('showList controllers.js 383');
      // dbFactory.showAList(listId, listName, userFilter);
      $state.go('app.list', {
        listId: listId
      });
    };

    /* Thing */
    $scope.showThing = function (thingId, thingName, userFilter) {
      // dbFactory.showThing( thingId, thingName, userFilter );
      $state.go('app.thing', {
        thingId: thingId
      });
    };

    // Initialize a new search.
    $scope.$watch(function () {
      // console.log('search watch found', $scope.search.term );
      return $scope.search.term;
    }, function (newValue, oldValue) {
      // console.log('TODO2 - This is where oldValue is used: ' + oldValue + ' to ' + newValue);
      if (typeof newValue !== 'undefined' && newValue !== oldValue) {

        dbFactory.promiseSearch(newValue, 'general').then(function (d) {

          $scope.search.results = d.results;
        });

      }
    });
  });
'use strict';
angular.module('friendsController', [])
  .controller('FriendsCtrl', function (dbFactory, $scope, localStorageService) {

    /* First - Load from Local Storage */
    $scope.friendStore = localStorageService.get('friendStore');
    // console.log('Friends Ctrl initiated');

    dbFactory.friendsList().then(function (d) {
      // console.log('dfriendsStore', d);
      $scope.friendStore = d;
      localStorageService.set('friendStore', d);
    });

    /* Second - Load from the api */
    $scope.reloadFriends = function () {
      // TODO2 - From pull down? Do this as part of the sorting options.
    };
  });
'use strict';
angular.module('addListController', [])
  .controller('addListCtrl', function ($scope, $stateParams, dbFactory, pltf, $state) {


    $scope.newList = {
      title: ''
    };
    $scope.listResults = [];
    // console.log('addListCtrl called');

    // Initialize a new search.
    $scope.$watch(function () {
      return $scope.newList.title;
    }, function (newValue, oldValue) {
      // console.log('Changed from unused oldvalue (TODO2) ' + oldValue + ' to ' + newValue);
      if (typeof newValue !== 'undefined' && newValue.length > 0 && newValue !== oldValue) {
        //   console.log('oldValue is not used. ', oldValue)
        dbFactory.promiseSearch(newValue, 'list').then(function (d) {
          // console.log('got content from list title search.');
          $scope.listResults = d.results;
        });
      }
    });

    // List Link
    $scope.showList = function (listId, listName, userFilter) {
      // console.log('showList controllers.js 361, RESTORE LINK TO LIST.');
      // TODO2 - Use focusTarget?
      $state.go('app.list', {
        listId: listId,
        listName: listName
      });
      // dbFactory.showAList(listId, listName, userFilter, focusTarget);
    };

    $scope.createList = function () {
      // console.log('User Clicked "Create List" with this title: ' + $scope.newList.title);

      dbFactory.newList($scope.newList.title).then(function (d) {

        if (parseInt(d)) {
          $state.go('app.list', {
            listId: d
          });
        }
        /* TODO2 Error Handling
        else {
          // console.log('invalid listid passed in the creation of a list.');
          // TODO2 Error Handling.
        } */
      });

    };

  });

'use strict';
angular.module('userController', [])
  .controller('UserCtrl', function ($scope, $stateParams, dbFactory, $rootScope, pltf, localStorageService) {
    // Prepare Scope Variables
    $scope.view = 'ditto'; // Initial View

    $scope.store = {
      'ditto': [{
        loading: true
      }],
      'shared': [{
        loading: true
      }],
      'feed': [{
        loading: true
      }],
      'lists': [{
        loading: true
      }],
      'chat': [{
        loading: true
      }]
    };
    $scope.userInfo = {
      userId: null,
      userName: null,
      fbuid: null
    };


    if ($stateParams.view) {
      $scope.view = $stateParams.view;
    }

    // load profile data if this was direct linked to.
    if (!$scope.userInfo.userId) {
      // console.log('no userid set in profiledata. Set with one of these. ', $stateParams.userId, typeof ($stateParams.userId));

      // Get it from the url then.
      // Get a valid user id, and pull content for it.
      if (parseInt($stateParams.userId) > 0) {

        // Get user information. TODO2 
        $scope.userInfo.userId = parseInt($stateParams.userId);
        // console.log('413 ', $scope.userInfo.userId);
      }
      /* TODO2 Properly handle this error  else {
        console.log('CONTROLLER.390 NO VALID USER FROM CONTENT.', $stateParams.profile);
      }
      */

    }
    /* TODO3-3 Handle the error else 
    {
        console.log('ERROR controllers.ProfileCtrl 391 - invalid userId in the URL.');
      }
      */

    var lsTypes = ['ditto', 'shared', 'feed', 'lists', 'chat'];

    if (parseInt($rootScope.user.userId) === parseInt($scope.userInfo.userId)) {
      lsTypes = ['feed', 'lists']; // TODO2 Put in the chat bit again.
      $scope.view = 'feed';
      // console.log('updated scope view ? ', $scope.view);
    }

    // This should be re-written to not be in a loop. TODO2
    for (var i in lsTypes) {

      if (lsTypes[i] === 'shared') {
        // Start from local storage.
        if (localStorageService.get('user' + $scope.userInfo.userId + 'shared')) {
          $scope.store.shared = localStorageService.get('user' + $scope.userInfo.userId + 'shared');
        }

        dbFactory.promiseGetSome($scope.userInfo.userId, '', 'shared').then(function (d) {
          $scope.store.shared = d;

          localStorageService.set('user' + $scope.userInfo.userId + 'shared', d);
          // console.log('update: in promise shared: ', d);
          //console.log('sun: ', $scope.userInfo.userName.length, ' dusername: ', d[0].username);

          if ($scope.userInfo.userName === null && d[0].username) {

            $scope.userInfo.userName = d[0].username;
            $scope.userInfo.fbuid = d[0].fbuid;
          }
        }
     );


      } else if (lsTypes[i] === 'ditto') {
        // Start from local storage.
        if (localStorageService.get('user' + $scope.userInfo.userId + 'ditto')) {
          $scope.store.ditto = localStorageService.get('user' + $scope.userInfo.userId + 'ditto');
        }

        dbFactory.promiseGetSome($scope.userInfo.userId, '', 'ditto').then(function (d) {
          $scope.store.ditto = d;
          localStorageService.set('user' + $scope.userInfo.userId + 'ditto', d);
          // console.log('update: in promise  ditto: ', d);
          if ($scope.userInfo.userName === null && d[0].username) {

            $scope.userInfo.userName = d[0].username;
            $scope.userInfo.fbuid = d[0].fbuid;
          }
        });

      } else if (lsTypes[i] === 'feed') {

        $scope.store.feed = [{
          loading: true
        }];

        dbFactory.promiseFeed('profile', $scope.userInfo.userId, '', '', '', '').then(function (d) {
          //           console.log('feedResponse', d);
          $scope.store.feed = d.results;

          if ($scope.userInfo.userName === null && d.results[0].username) {

            $scope.userInfo.userName = d.results[0].username;
            $scope.userInfo.fbuid = d.results[0].fbuid;
          }
        });


      } else if (lsTypes[i] === 'lists') {
        if (localStorageService.get('user' + $scope.userInfo.userId + 'lists')) {
          $scope.store.feedlists = localStorageService.get('user' + $scope.userInfo.userId + 'lists');
        }

        dbFactory.promiseListOfLists($scope.userInfo.userId).then(function (d) {
          $scope.store.lists = d;
          localStorageService.set('user' + $scope.userInfo.userId + 'lists', d);

          if ($scope.userInfo.userName === null && d[0].username) {

            $scope.userInfo.userName = d[0].username;
            $scope.userInfo.fbuid = d[0].fbuid;
          }
        });


      }
      /* TODO2 Handle this condition.
      else {
        console.log('TODO1 - Auto load this');
      }
      */

    }

    // Make sure that we have user information by now.
    if (!$scope.userInfo.userName) {
      // console.log('595 - No user name', $scope.userInfo.userName);
      dbFactory.userInfo($scope.userInfo.userId).then(function (d) {
        // console.log('user info: ', d);
        $scope.userInfo.fbuid = d.results.fbuid;
        $scope.userInfo.userName = d.results.userName; // Tested, and this works. 1/27/2015
      });
      /* TODO3 - Handle user name
      } else {
        console.log('597 - User name', $scope.userInfo.userName);
      }
      */


      // Put the user info in the title bar
      $scope.profileTitle = '<img src="http://graph.facebook.com/' + $scope.fbuid + '/picture" class="title-image"> ' + $scope.userName;

      $scope.showFeed = function (userId) {
        // Reload on second tap only, or if there are no records yet.
        console.log('Do something with userId? ' + userId);
        var loadFromDb = false;
        console.log('load showfeed? ', $scope.view === 'feed', $scope.store.feed[0].loading, typeof ($scope.store.feed[0].uid) === 'undefined');
        if ($scope.view === 'feed' || typeof ($scope.store.feed[0].loading) !== 'undefined' || typeof ($scope.store.feed[0].uid) === 'undefined') {
          loadFromDb = true;

        }

        $scope.view = 'feed';
        // console.log('profile show feed: ', userId, ' oldest: ');
        // showFeed = function(theType, userFilter, listFilter, myState, oldestKey)
        // $scope.store.feed = dbFactory.showFeed('profile',userId,'','','','');

        // Then Update
        if (loadFromDb === true) {
          $scope.store.feed = [{
            loading: true
          }];
          dbFactory.promiseFeed('profile', $scope.userInfo.userId, '', '', '', '').then(function (d) {
            $scope.store.feed = d.results;
            if ($scope.userInfo.userName === null && d.results[0].username) {

              $scope.userInfo.userName = d.results[0].username;
              $scope.userInfo.fbuid = d.results[0].fbuid;
            }
          });
        }
      };

      $scope.userChat = function () {
        $scope.view = 'chat';
      };

      $scope.getSome = function (filter) {
        //  Reload only if it's the second press of the button
        if ($scope.view === filter) {
          $scope.store[filter] = [{
            'loading': true
          }];
          dbFactory.promiseGetSome($scope.userInfo.userId, '', filter).then(function (d) {
            $scope.store[filter] = d;
            // console.log('update: in promise ' + filter + ' : ', d);
            if ($scope.userInfo.userName === null && d[0].username) {

              $scope.userInfo.userName = d[0].username;
              $scope.userInfo.fbuid = d[0].fbuid;
            }
          });
        }
        $scope.view = filter;

        // console.log('profileScope view after getSome: ', $scope.view);

        // console.log('Get Some for userid: ', $scope.userInfo.userId, filter, 'end');
        // $scope.store[ filter ] = dbFactory.showFeed('profile', $scope.userId, filter , '', '', '');
        // 
        // dbGetSome = function (theScope, userfilter, listfilter, sharedFilter)
        // dbFactory.dbGetSome('$rootScope.profileData.'+filter, userId, '', filter);
      };

      $scope.showLists = function (userId) {
        // Only reload if it's already lists.
        if ($scope.view === 'lists' || $scope.store.lists[0].loading || !$scope.store.lists.length) {
          // console.log('reload lists for this user in their profile..');
          // dbFactory.getUserListOfLists(userId, '$rootScope.profileData.lists');
          $scope.store.lists = [{
            loading: true
          }];
          dbFactory.promiseListOfLists(userId).then(function (d) {
            $scope.store.lists = d;

          });

        }
        /* Default to lists if we need to. */
        $scope.view = 'lists';
      };

    }
  });

'use strict';
angular.module('chatController', [])
  /* Controller in the Chat */
  .controller('chatCtrl', function () {
    // $scope, dbFactory
    /* TODO1 - Update the notification count ? */
    // Look at the chat.html template to learn how to do this.
  });
'use strict';
angular.module('loginController', [])
  .controller('LoginCtrl', function ($scope, $window, $rootScope, $state) {


    $scope.loginOAuth = function (provider) {
      $rootScope.loginMessage = '1. loginOAuth Pressed';

      // TODO1 - This is the bit that handles the login.
      if (provider === 'facebook') {

        // Do that.
        /* RETURN 1/19/2015 */
        $rootScope.loginMessage = '1. Facebook loginOAuth Initiated';
        // Go to controllers.26
        $rootScope.$broadcast('broadcast', {
          command: 'login',
          platform: 'facebook',
          debug: 'controller.js 506 login with facebook.'
        });

        // 5/4 Disabled.
        $state.go('loading'); // TODO 1 - Is this working?
        // Facebook.login();

      } else {
        $rootScope.loginMessage = '2. END - Unknown OAuth Provider';

      }
      // $window.location.href = '/auth/' + provider;
    };
  });

'use strict';
angular.module('listController', [])
  .controller('ListCtrl', function ($scope, $stateParams, $rootScope, dbFactory, localStorageService, pltf) {


    $scope.view = 'ditto';
    $scope.store = {
      'ditto': [{
        loading: true
      }],
      'shared': [{
        loading: true
      }],
      'feed': [{
        loading: true
      }],
      'mine': [{
        loading: true
      }],
      'strangers': [{
        loading: true
      }]
    };

    $scope.listInfo = {
      listId: $stateParams.listId,
      listName: null
    };

    /* Clear any previously entered text in the 'add to list' section */
    $scope.newItem = {
      theValue: null
    };


    // Populate the list on load.
    var listViews = new Array('ditto', 'shared', 'feed', 'mine', 'strangers');

    // TODO2 - userIdFilter is ignored. It should allow for a specific user to be viewed. 
    var userIdFilter = 0; // TODO2 - Allow this to be set.
    var sharedFilter = 0; // TODO2 - Allow this to be set.
    var oldestKey = 0; // TODO2 - Allow this to be set.

    /* Load all the list view types */
    var i = 0;
    for (i in listViews) {
      /*
      if (!$scope.store[listViews[i]].length) {
        $scope.store[listViews[i]][0] = {
          loading: true
        };
      }
      */

      /* Apply local storage if it's present */
      if (localStorageService.get('listId' + $stateParams.listId + listViews[i])) {
        $scope.store[listViews[i]] = localStorageService.get('listId' + $stateParams.listId + listViews[i]);
      }

      /* Load each of the views from the API */
      dbFactory.promiseList($scope.listInfo.listId, userIdFilter, listViews[i], sharedFilter, oldestKey).
      then(function (d) {

        /*  
          Only apply valid responses to the scope. Types could be null. 
           use d.type because of async responses require the data to define itself. 
        */
        if (typeof (d.type) !== 'undefined') {
          $scope.store[d.type] = d.results[d.type];
        } else {
          /* if no response, clear the results */
          //         $scope.store[d.type] = [];
          pltf.log('controllers1013 - This condition could be required for error handling.');
        }

        /* If there are results, and we need a list name, then apply the list name from the data */

        if ($scope.listInfo.listName === null && typeof (d.results) !== 'undefined' && typeof (d.results[d.type]) !== 'undefined' && typeof (d.results[d.type].lists) !== 'undefined' && typeof (d.results[d.type].lists[0].listname) !== 'undefined') {
          $scope.listInfo.listName = d.results[d.type].lists[0].listname;
        }
      });
    }

    /* If we don't have a list name at this point, it must be a new list. Force Load it. */
    if ($scope.listInfo.listName === null || $scope.listInfo.listName.length === 0) {
      console.log('force load the list info, and assume this user created the list');
      dbFactory.promiseThingName($scope.listInfo.listId).then(function (d) {
        console.log('d.results: ' + d.results + ' length: ' + d.results.length);
        if (d.results) {
          console.log('valid results from d.results' + d.results[0].thingName);
          $scope.listInfo.listName = d.results[0].thingName;
          // Set the view to theirs, so they can add an item.
          $scope.view = 'mine';

        }

      });
    }

    /* End the scope loading. */

    // TODO3 - Link directly to parts of this view. i.e. lists/400/view/shared

    /* This is the function used when changing views */
    $scope.setView = function (theView) {

      /* If it is already this view, or loading, then reload this content. */
      if (theView === $scope.view || $scope.store[theView].length === 0 || $scope.store[theView][0].loading === true) {

        /* Create the loading Indicator */
        $scope.store[theView] = [{
          loading: true
        }];

        /* The the view is passed as part of the database call */
        dbFactory.promiseList($scope.listInfo.listId, userIdFilter, theView, sharedFilter, oldestKey).then(function (d) {

          // only add it to the scope if it's a valid response.
          if (typeof (d.type) !== 'undefined') {
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

    $scope.addToList = function (newItemName) {
      //Step - Focus the view on your list.
      $scope.view = 'mine';
      console.log('FELIX   FELIX   FELIX   controllers.listCtrl.addToList(newItem)' + newItemName);
      // Step: Make sure that there is something.
      if (!newItemName.length) {
        console.log('no length for the new item. 1054');
        return;
      }

      // Step: Clear the new item model.
      $scope.newItem.theValue = null;

      /* Create a placeholder for while the API responds */
      var tempNum = pltf.randNum(10000);
      console.log('tempNum: ' + tempNum);
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
        thingname: '... ' + newItemName,
        tid: null
      };

      /* Create My List if this is the first item in my list */
      if ($scope.store.mine.length === 0) {
        // console.log('create my list because my list has no length' + $scope.store.mine.length);
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
        // Add my new list to the store 
        $scope.store.mine.unshift(myList);

      } // TODO2 Handle the error condition 
      else {
        console.log('my existing list has a length of : ' + $scope.store.mine.length);
      }

      /* remove the existing item from my list visibly. */
      // But only if I have existing items. 
      if (!$scope.store.mine[0].lists[0].items.length) {
        // console.log('crisis averted. items: ', $scope.store.mine[0].lists[0].items.length);
        // NOTE - This is how I remove my out of date items. 
      } else {
        var j = $scope.store.mine[0].lists[0].items.length;
        var i = 0;
        while (i < j) {

          // Step - It matched. Note it.
          if ($scope.store.mine[0].lists[0].items[i].thingname.toUpperCase() === newItemName.toUpperCase()) {
            $scope.store.mine[0].lists[0].items.splice(i, 1);
            break;
          }
          i++;
        }

      }

      /* Step - Add this item as the first item in my list */
      $scope.store.mine[0].lists[0].items.unshift(tempItem);

      /* Step Prepare to submit to the dbFactory */
      var itemObj = {
        lid: $scope.listInfo.listId,
        thingName: newItemName
      };


      /* Step - Submit to the database */
      dbFactory.promiseAddToList(itemObj).then(function (d) {
        // console.log('new item (response): ', newItemName, d);
        /* Check to see if the item has a valid key */
        if (typeof (d.mykey) !== 'undefined') {

          /* Valid results from the API. Begin processing adding this item */
          /* Overwrite the temp value. We know that it will only have one entry. */
          var newItemPos = null;
          var i = 0,
            j = 0;
          for (i in $scope.store.mine[0].lists[0].items) {
            if ($scope.store.mine[0].lists[0].items[i].id === tempNum) {
              newItemPos = i;
              break;
            }
          }

        }
        /* TODO2 - Handle this error condition. else {
                  console.log('error. TODO2 - Handle this? ');
                }
                */

        /* Overwrite the temp item with the new item. I will be in the right spot. */
        $scope.store.mine[0].lists[0].items[i] = d;

        // console.log('updatedItem: ', $scope.store.mine[0].lists[0].items[i]);

      });


    };
    /* End List Control */
  });
'use strict';
angular.module('listsController', [])

/* 10/21/2014 - Added RootScope to populate the list with? TODO1 - Build lists from $rootScope.lists */
.controller('ListsCtrl', function ($scope, dbFactory, localStorageService, $rootScope) {

  // On load, load up their lists.
  $scope.listsData = localStorageService.get('user' + $rootScope.user.userId + 'lists');

  // On Load; Update with new data

  dbFactory.promiseListOfLists($rootScope.user.userId).then(function (d) {
    $scope.listsData = d;
  });


  $scope.loadLists = function () {
    // user.userId is hard coded in lists, because it's always going to be this user's lists.

    dbFactory.promiseListOfLists($rootScope.user.userId).then(function (d) {
      $scope.listsData = d;
    });
  };

  // TODO3 Delete a list
});
'use strict';
angular.module('feedContrller', [])
  .controller('FeedCtrl', function ($scope, dbFactory, localStorageService) {

    // On load, open friends.
    $scope.view = 'friends';
    $scope.store = {
      friends: [{
        loading: true
    }],
      strangers: [{
        loading: true
    }]
    };

    // Populate the feeds on load
    if ($scope.store.friends.length === 0 || $scope.store.friends[0].loading === true) {
      if (localStorageService.get('feedFriends')) {
        $scope.store.friends = localStorageService.get('feedFriends');
      }

      $scope.store.friends[0] = {
        loading: true
      };
      dbFactory.promiseFeed('friends', '', '', '', '', '').then(function (d) {
        $scope.store[d.type] = d.results;
      });
    }

    // Populate the feeds on load
    if ($scope.store.strangers.length === 0 || $scope.store.strangers[0].loading === true) {

      if (localStorageService.get('feedStrangers')) {
        $scope.store.strangers = localStorageService.get('feedStrangers');
      }

      $scope.store.strangers[0] = {
        loading: true
      };

      dbFactory.promiseFeed('strangers', '', '', '', '', '').then(function (d) {
        $scope.store[d.type] = d.results;

      });
    }

    // var mainFeed = function (theType, continueFrom, userFilter, listFilter, sharedFilter, scopeName, newerOrOlder){
    // dbFactory.mainFeed('friends', '', '', '', '', 'feed.friends',''); // Should only evaluate when navigating to "feed"

    $scope.feed = function (filter, continueFrom, newerOrOlder) {
      if (filter === $scope.view) {
        /* Refresh */
        $scope.store[filter] = [{
          loading: true
      }];
        dbFactory.promiseFeed(filter, '', '', '', '', '').then(function (d) {
          $scope.store[filter] = d.results;
        });
      }
      // Set the active view.
      $scope.view = filter;
    };
  });
'use strict';
angular.module('thingController', [])

.controller('ThingCtrl',
  function ($scope, dbFactory, $stateParams, localStorageService) {

    $scope.thing = {
      name: 'Loading',
      id: $stateParams.thingId,
      data: [{
        loading: true
      }]
    };

    if (localStorageService.get('thing' + $stateParams.thingId)) {
      // console.log('local storage. Found thing by id/');
      $scope.thing.data = localStorageService.get('thing' + $scope.thing.id);
    } else {
      // console.log('no thing in local storage: ', $stateParams.thingId);
      
    }

    // console.log('thingid: ', $scope.thing.id );
    /* Load thing information from the Api 1/23/2015 */
    dbFactory.promiseThing($scope.thing.id, '').then(function (d) {
      $scope.thing.data = d;
      if (d.length) {
        $scope.thing.name = d[0].lists[0].items[0].thingname;
      }
      localStorageService.set('thing' + $stateParams.thingId, d);

    });

    // Update the thing info from the api
    // console.log('TODO1 - Load this from the API, automatically? .');

    // Control for thing goes here.
    // console.log('controllers.js.thingCtrl use scope, rootscope, dbFactory', $scope);

  }
);
'use strict';
angular.module('homeController', [])

.controller('HomeCtrl', function ($scope, dbFactory, $interval, localStorageService) {
  /* TODO2 Add Timers
  $scope.timers = {
    friendsLoad: 0,
    strangersLoad: 0,
    friendsGet: 0,
    strangersGet: 0
  };


  $interval(function () {
    $scope.testTime++;
  }, 10);
  */
  $scope.store = {
    'friends': [{
      loading: true,
      loadingTime: 0
    }],
    'strangers': [{
      loading: true,
      loadingTime: 0
    }]
  };

  // Creat the intervalTimer, so we can kill it later
  // TODO2 $scope.intervalTimer = null;

  // Load up some content for both views
  // LOAD FRIENDS
  if ($scope.store.friends[0].loading || $scope.store.friends[0].length === 0) {
    // First, load from local storage, if it's there.
    if (localStorageService.get('bitefriends')) {
      $scope.store.friends = localStorageService.get('bitefriends');
    } else {
      // Empty whatever's in the scope
      $scope.store.friends = [];

      /* // TODO2 
      $scope.intervalTimerFL = $interval(function () {
        // Build in a self destruct.
        if ($scope.timers.friendsLoad > 1000) {
          $interval.cancel($scope.intervalTimerFL);
          $scope.intervalTimerFL = null;
        }
        $scope.timers.friendsLoad++;
      }, 10);
      */

      dbFactory.promiseGetSome('friends', '', 'ditto').then(function (d) {


        $scope.store.strangers = d;
        // End the timer
        // TODO2 $interval.cancel($scope.intervalTimerFL);
        // TODO2 $scope.intervalTimerFL = null;

      });
    }


  }

  if ($scope.store.strangers[0].loading || $scope.store.strangers[0].length === 0) {
    // First, load from local storage, if it's there.
    if (localStorageService.get('bitestrangers')) {
      $scope.store.strangers = localStorageService.get('bitestrangers');
    } else {
      /*
            $scope.intervalTimerSL = $interval(function () {
              // Build in a self destruct.
              if ($scope.timers.strangersLoad > 1000) {
                $interval.cancel($scope.intervalTimerSL);
                $scope.intervalTimerSL = null;
              }
              $scope.timers.strangersLoadLoad++;
            }, 10);
      */
      dbFactory.promiseGetSome('strangers', '', 'ditto').then(function (d) {

        $scope.store.strangers = []; // Remove the timer.
        $scope.store.strangers = d;
        // End the timer
        // TODO2 $interval.cancel($scope.intervalTimerSL);
        // TODO2 $scope.intervalTimerSL = null;

      });
    }

  }

  $scope.view = 'friends';

  $scope.getSome = function (typeFilter) {
    console.log('typeFilter: ', typeFilter);
    // TODO2 $scope.timers[typeFilter + 'Get'] = 0;
    // dbGetSome = function (theScope, userfilter, listfilter, sharedFilter)
    if ($scope.view === typeFilter || typeof ($scope.store[typeFilter][0].uid) === 'undefined') {
      $scope.view = typeFilter;
      // They already are on this view, so reload it, or the view is undefined. 


      $scope.store[typeFilter] = [{
        loading: true,
        loadingTime: 0
      }];

      // Start the timer
      /* TODO2 
            $scope['intervalTimer' + typeFilter] = $interval(function () {
              // Build in a self destruct.
              if ($scope.timers[typeFilter + 'Get'] > 1000) {
                $interval.cancel($scope['intervalTimer' + typeFilter]);
                $scope['intervalTimer' + typeFilter] = null;
              }
              $scope.timers[typeFilter + 'Get'] ++;
            }, 10);
      */

      dbFactory.promiseGetSome(typeFilter, '', 'ditto').then(function (d) {

        // Load the data, overwriting the timer and loading parameter
        $scope.store[typeFilter] = d;
        // TODO2       $interval.cancel($scope.intervalTimer);
        // TODO2 $scope.intervalTimer = null;

      });

      // Stopethe timer
      // This doesn't allow it to ever work. $interval.cancel($scope.intervalTimer);
      // TODO2 $scope.intervalTimer = null;
      /*
            if ($scope.timers[typeFilter] > 100) {
              $scope.store[typeFilter] = {
                error: true,
                errorText: 'loadingTimedOut'
              };
              $interval.cancel($scope.intervalTimer);
              $scope.intervalTimer = null;
              */
      // return true;
      // }

    } else {
      $scope.view = typeFilter;
    }



  };

});
'use strict';
angular.module('docsController', [])

.controller('DocsCtrl', function () {
  // TODO2 - The docs and about could be dynamically populated from Scope.

});
'use strict';
angular.module('debugController', [])
  .controller('DebugCtrl', function ($scope, dbFactory, localStorageService, $state, pltf) {

    $scope.localStorage = function (type) {
      if (type === 'get') {
        localStorageService.get('debugNote');
      } else if (type === 'set') {
        localStorageService.set('debugNote', 'The Current Unix Time is: ' + Date.now());
      }
      // console.log('test debug local Storage');
    };

    $scope.funny = function (type) {
      if (type === 'rootScope') {
        // $scope.funnyText = $rootScope.length;
        $scope.funnyText = 50;
      } else if (type === 'stateName') {
        $scope.funnyText = {
          'currentTime': Date.now(),
          'state.current.name': $state.current.name
        };
      } else if (type === 'querystring') {
        $scope.funnyText = 'querystring!';

        pltf.Querystring();

      } else if (type === 'htmlLength') {
        // 
        $scope.funnyText = pltf.domSize('return');
        console.log($(document.body).html());

      } else if (type === 'currentTime') {
        var d = new Date();
        var n = d.getTimezoneOffset();
        $scope.funnyText = 'The Time Is: ' + d + ' and timezone offset: ' + d.getTimezoneOffset();

        $scope.funnyTime = moment().format();

      } else {
        $scope.funnyText = 'note ready ' + Date();
      }
    };


    $scope.thisDomain = function () {
      //  console.log('thisDomain: ', document.URL);
      $scope.funnyText = 'domain: ' + document.URL;
    };

    $scope.debugCtrl = function () {
      // Maybe there will be a global debug command? 
    };

    $scope.debugLog = [{
      startItem: 'this is the start item'
  }];

    $scope.testString = function () {
      $scope.debugLog = 'string';
    };

    $scope.testObj = function () {
      $scope.debugLog = JSON.stringify([{
        item: 'this is a test item'
    }]);
    };

  });
'use strict';
angular.module('loadingController', [])
  .controller('LoadingCtrl', function ($scope, $rootScope) {

    // Control for thing goes here.
    $scope.thetoken = $rootScope.token;
    // $rootScope.debug('loadingctrl loaded');

    /* When this screen loads, if there is a token, go home. */
    if (typeof $rootScope.token === 'string' && $rootScope.token !== 'loading') {
      // console.log('Controllers 259 Done loading. Go home.');
      $rootScope.$broadcast('broadcast', {
        command: 'state',
        path: 'app.home',
        debug: 'Controllers.js 260. Go home.'
      });
    }

    $scope.showToken = function () {
      // $rootScope.debug('LoadingCtrl showToken');

      $scope.thetoken = $rootScope.token;
    };

    $scope.clearToken = function () {
      // $rootScope.debug('LoadingCtrl clearToken');
      $rootScope.token = '';

      $scope.thetoken = 'cleared!';
    };

    $scope.setToken = function () {
      // $rootScope.debug('LoadingCtrl setToken to 35358a19f081483800da33f59635e86f');
      $rootScope.token = '35358a19f081483800da33f59635e86f';
      $scope.thetoken = '35358a19f081483800da33f59635e86f';
    };
  });