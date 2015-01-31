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
  'Plitto.controllers',
  'Plitto.services',
  'angularMoment',
  'LocalStorageModule'
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
  })
  /* Config Defaults */
  .constant('pltf', {
    'domSize': function (output) {
      if (output === 'console') {
        console.log('HTMLString', $(document.body).html().length);
      } else if (output === 'return') {
        return $(document.body).html().length;
      }

    },
    'log': function (toLog) {

      // turned debug off. 
      // 

      console.log(toLog);
    },
    'QueryString': function () {
      'use strict';
      // console.log('70 NO NEED FOR THIS QUERYSTRING FUNCTION???');

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
      'use strict';
      // console.log('plainJsRedirect: ', url);
      // window.location.href = url;
      // window.location.assign(url);
      setTimeout(function () {
        location.href = url;
      }, 5000);

    },
    'randNum': function (maxNum) {
      'use strict';
      return Math.floor((Math.random() * maxNum) + 1);
    }
  })



.run(function ($ionicPlatform, $rootScope, dbFactory, OAuth, $state, pltf) {
  /* Deleted 1/28/2015. Works without it. 1/29/2015 - MAYBE NOT!
  */
  // Check to see if Facebook is giving us a code to use in the URL.
  if(pltf.QueryString.code){
    // Make the Plitto API call
    console.log('RUN URL because we found it.', pltf.QueryString.code);
    // TODO1 - Put this backdbFactory.fbTokenLogin(pltf.QueryString.code);
  }

  $ionicPlatform.ready(function () {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    // Get the access token from Facebook. TODO1 - 12/20 - It looks like something is intercepting it, and removing it.
    // console.log('ionicPlatform.run: access_token location: ', window.location.hash.indexOf('access_token'));
    if (window.location.hash.indexOf('access_token') !== -1) {
      /* Debug 1/27/2015 REMOVED Batch 3
      console.log('ionicPlatform.run: Found the token.',
        window.location.hash,
        window.location.hash.indexOf('access_token')
      );
      // TODO2UX - Show a loading indicator
      */
      var hash = window.location.hash;

      // Show loading.
      $state.go('loading');

      var fbAccessToken = hash.substring(hash.indexOf('access_token=') + 'access_token='.length, hash.indexOf('&'));
      // console.log('app118 at: ' + fbAccessToken);

      $rootScope.loginMessage = 'Facebook Access Granted. Logging into Plitto now.';
      //  + fbAccessToken

      // Use this to make the call to login.
      dbFactory.fbTokenLogin(fbAccessToken);
    }


  });
})

.config(function ($stateProvider, $urlRouterProvider, $httpProvider, pltf) {


    $stateProvider
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

    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'AppCtrl'
    })

    .state('app.home', {
      url: '/home',
      views: {
        'menuContent': {
          templateUrl: 'templates/home.html',
          controller: 'HomeCtrl'
        }
      }
    })

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


    .state('app.profile', {
      url: '/profile/:userId',
      views: {
        'menuContent': {
          templateUrl: 'templates/profile.html',
          controller: 'ProfileCtrl'
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
    })

    .state('app.thing', {
      url: '/thing/:thingId',
      views: {
        'menuContent': {
          templateUrl: 'templates/thing.html',
          controller: 'ThingCtrl'
        }
      }
    })

    .state('app.list', {
      url: '/list/:listId',
      views: {
        'menuContent': {
          templateUrl: 'templates/list.html',
          controller: 'ListCtrl'
        }
      }
    });

    $urlRouterProvider.otherwise('/home'); // Added 12.19.2014


    // if none of the above states are matched, use this as the fallback
    // TODO1 - Do this. $urlRouterProvider.otherwise('/app/home');
    // console.log('QUERYSTRING ACCESS TOKEN: ', pltf.Querystring('TESTSTRING'));
    /* Removed 1/29/2015 Ok for troubleshooting? */
    if (pltf.QueryString('access_token') || window.location.hash.indexOf('access_token') > -1) {
      console.log('found querystring access token.' + pltf.QueryString('access_token'));

    } else {

      console.log('No access token. Let the user log in.', 'access_token: ');
      console.log(pltf.QueryString('access_token') + 'Location hash: ' + window.location.hash);
      // $urlRouterProvider.otherwise('/app/home');
      // console.log("REPLACeD", window.location.hash.replace("#/",""));

      //http://localhost/plitto-ionic/client/app/?#/access_token=CAAAAMD0tehMBAMUwibZCHQrzYS3v6QdLKTsIlWveB7CTSV0ZByuItJP8u7tF3xaYjGBNjeT7BDRjVWA9WwwelEjMAZCiKgi9C5dDIAUfZAUwdqPQlxxDbykoslmJs8OhyNRpXEoU0o6fC2eiYMROqOLvW8C1A0NU72YBmgcWitSom8Yw0rdEQCLktU6t1xdePnNKLLq75dlANujWVRvgcsgIuZCjZAZC9IZD&expires_in=6952

      // TODO1 - Put this back $urlRouterProvider.otherwise('/app/home');
    }


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

  })
  .directive('userNav', function ($rootScope, dbFactory, $state, pltf) {




    return {
      restrict: 'E',
      // templateUrl: 'directives/userNav.html',
      template: '<ion-nav-bar class="bar-stable plittoBar">' +
        '<ion-nav-back-button></ion-nav-back-button>' +
        '<ion-nav-buttons side="left">' +

        '<button menu-toggle="left" class="button button-icon icon ion-navicon"></button>' +
        '</ion-nav-buttons>' +
        '<ion-nav-buttons side="secondary" class="navSecond">' +

        '</button>' +
        '<a href="#/app/addlist" class="button button-icon ionicons ion-plus-circled"></a> ' +
        '<a href="#/app/home" class="button button-icon ion-ios7-checkmark-outline"></a> ' +
        '<a href="#/app/search" class="button button-icon ion-search"></a> ' +
        '</ion-nav-buttons>' +
        '</ion-nav-bar>'
        // scope: {}
        /*
        , controller: function ($scope, dbFactory, $state, pltf) {
          /
          };}
          */

    };
  })

.directive('userListThing', function ($rootScope, dbFactory, $state) {


    return {
      restrict: 'E',
      templateUrl: 'directives/userListThing.html',
      scope: {
        store: '@store',
        source: '@source',
        userData: '=userData'
      },
      controller: function ($scope, dbFactory) {

        /* Show More? */
        $scope.showMore = true;

        /* Ditto */
        $scope.ditto = function (mykey, uid, lid, tid, itemKey, $event) {

          var arrPair = new Array();

          var i, j, k;
          // If the list matches, and the thing matches, then update the ditto info.

          // Traverse this user's lists to find the existing item.
          for (var i in $scope.userData.lists) {
            if (lid === $scope.userData.lists[i].lid) {
              for (j in $scope.userData.lists[i].items) {
                // console.log('check 426: ',$scope.userData.lists[i].items[j].tid, tid);
                if ($scope.userData.lists[i].items[j].tid === tid) {
                  $scope.userData.lists[i].items[j].mykey = 0; // TODO - This could be causing a bug.
                  if (mykey) {
                    $scope.userData.lists[i].items[j].friendsWith = '?';
                  }
                  /* Log the position in the array that will be used to update */
                  arrPair.push(new Array(i, j));
                }
              }
            }
          }

          // Convert this to a scope return. dbFactory.dbDitto( scopeName, mykey, uid, lid, tid, itemKey, $event);
          var dbResponse = [];

          /* The elements are [0] - mykey / null , [1]:[friendsWith] / undefined - [2]['ditto'/'remove'] */
          dbFactory.promiseDitto(mykey, uid, lid, tid, itemKey, $event).then(function (d) {

            for (k in arrPair) {
              if (parseInt(d[0])) {
                // Update my key with my new one.
                $scope.userData.lists[arrPair[k][0]].items[arrPair[k][1]].mykey = String(d[0]);
              } else {
                // Set my key to null, because I don't have it any more.
                $scope.userData.lists[arrPair[k][0]].items[arrPair[k][1]].mykey = null;
              }

              if (parseInt(d[1])) {
                $scope.userData.lists[arrPair[k][0]].items[arrPair[k][1]].friendsWith = '+' + d[1];
              } else {
                $scope.userData.lists[arrPair[k][0]].items[arrPair[k][1]].friendsWith = '';
              }
            }
          });
        };

        /* User */
        $scope.showUser = function (userId, userName, dataScope, fbuid) {
          if(parseInt(userId) !== 0 ){
            $state.go('app.profile', {
              userId: userId,
              userName: userName
            });
            // dbFactory.showUser(userId,userName, dataScope, fbuid);
            $scope.userData = [];
          }
        };

        /* List */
        $scope.showList = function (listId, listName, userFilter, focusTarget) {
          // TODO - Fix this. dbFactory.showAList(listId, listName, userFilter, focusTarget);
          $state.go('app.list', {
            listId: listId,
            listName: listName
          });
          $scope.userData = [];
        };

        /* Thing */
        $scope.showThing = function (thingId, thingName, userFilter) {
          
          $state.go('app.thing', {
            thingId: thingId,
            thingName: thingName
          });
          $scope.userData = [];
          
          // dbFactory.showThing(thingId, thingName, userFilter);
        };

        /* Let's Chat
        letsChat(userData.uid, list.lid, item.tid, item.ik, $event, $index); " */
        $scope.letsChat = function (uid, lid, tid, itemKey, $event, $index) {
          // console.log('letsChat app.js directive', uid, lid, tid, itemKey, $event, $index);
          // var length = eval('$rootScope.' + store + '.length');

          // console.log('letschat scope.userData', $scope.userData);

          // Find the item in this list.
          var i = 0,
            j = 0,
            abort = false;
          loop1:
            for (i in $scope.userData.lists) {
              if (lid === $scope.userData.lists[i].lid) {
                var j = 0;
                loop2:
                  for (j in $scope.userData.lists[i].items) {
                    if ($scope.userData.lists[i].items[j].ik === itemKey) {
                      break loop1;
                    }
                  }
              }
            }

          // console.log('vars: i,j',i,j);

          var isActive = 1;
          if ($($event.target).hasClass('active')) {
            // User is removing this from their chat queue.
            isActive = 0;
            $($event.target).removeClass('active');
            $('div#comments' + uid + lid + tid).hide();
            // RESTORE? eval('$rootScope.' + store + '[' + upos + '].lists[' + lpos + '].items[' + tpos + '].commentActive = null; ' );
            $scope.userData.lists[i].items[j].commentActive = null;
          } else {

            $($event.target).addClass('active');
            $('div#comments' + uid + lid + tid).show();
            // eval('$rootScope.' + store + '[' + upos + '].lists[' + lpos + '].items[' + tpos + '].commentActive = "1"; ' 
            $scope.userData.lists[i].items[j].commentActive = '1';

          }
          // Call the addComment bit to activate or deactivate the queue item
          dbFactory.promiseAddComment(uid, lid, tid, itemKey, '0', isActive).then(function (d) {
            console.log('481ult added comment');
          });
          console.log('commentactive:  ',
            // eval('$rootScope.' + store + '[' + upos + '].lists[' + lpos + '].items[' + tpos + '].commentActive; '  )
            $scope.userData.lists[i].items[j].commentActive
          );
        };

        $scope.makeItemComment = function (newComment, uid, lid, tid, itemKey, $index) {
          console.log('makeItemComment', newComment, uid, lid, tid, itemKey, $index);
          // Find the user, then the list, then use the index.
          // var length = eval('$rootScope.' + store + '.length' );

          // Get the user ID number.
          var upos = null;
          var lpos = null;
          var tpos = null;


          // Find the item in this list.
          var i = 0,
            j = 0;
          loop1:
            for (i in $scope.userData.lists) {
              if (lid === $scope.userData.lists[i].lid) {
                var j = 0;
                loop2:
                  for (j in $scope.userData.lists[i].items) {
                    if ($scope.userData.lists[i].items[j].ik === itemKey) {
                      break loop1;
                    }
                  }
              }
            }

          // console.log('vars: i,j', i, j);
          $scope.userData.lists[i].items[j].commentText = newComment;

          // submit it to the database
          // 
          dbFactory.promiseAddComment(uid, lid, tid, itemKey, newComment, '1').then(function (d) {
            console.log('ult521 add comment');
          });

          // TODO1 Clear the comment field

        };

        // moreOfThis( userData.uid, list.lid, $event, $index );
        $scope.moreOfThis = function (lid) {
          // console.log('app.ult.moreOfThis: ,  lid: ', lid, ' userData: ', $scope.userData, $scope.userData.lists.length);
          // Note: A null userId is required to get content from a user and their contacts. A 0 will return strangers.

          // Track the final list position in userData. 
          var finalJ = null;
          // console.log('ud lengthL '+ $scope.userData.length);
          // Create something to hold items.
          var listTids = new Array();

          // Find this list position.
          for (var j = 0; j < $scope.userData.lists.length; j++) {
            //  console.log('app.ult.moreofthis lidTEST', $scope.userData.lists[j].lid, lid);
            if ($scope.userData.lists[j].lid === lid) {
              finalJ = j;
              // console.log('j, finalj', j, finalJ);

              for (var i = 0; i < $scope.userData.lists[j].items.length; i++) {
                // itemIds.push = $scope.userData.lists[j].items[i].ik;\
                listTids.push($scope.userData.lists[j].items[i].tid);
                //console.log('app.ult.moreofthis $scope.userData.lists[j].items[i]' , $scope.userData.lists[j].items[i].ik );
              }
              // Set i, j to 1000 to end the loop. 
              finalJ = j;
              i = 1000;
              j = 1000;
              // console.log("END THE LOOP!");
            }
          }
          // Ask for 10 more items, for now.
          $scope.showMore = '0';

          // User Id, List Id, filter: 'all' future: ditto, shared, tids, limit 
          dbFactory.getMore($scope.userData.uid, lid, 'all', listTids, 10).then(function (d) {
            // We only need the user's items. It will be just one user, and just this list, which we know where it is thanks to the i variable above. 

            if (!d.results.length) {
              // We ran out of more items!
              $scope.showMore = false;
            } else {
              // We have results. Merge them.

              $scope.userData.lists[finalJ].items = $scope.userData.lists[finalJ].items.concat(d.results[0].lists[0].items);

              /*
              for(var i = 0; i < d.results[0].lists[0].items.length; i++){
                // console.log('d.results[0].lists[0].items[i]', d.results[0].lists[0].items[i]);
                // $scope.userData.lists[finalJ].items.splice(0, 0, d.results[0].lists[0].items[i]);
                $scope.userData.lists[finalJ].items.push(d.results[0].lists[0].items[i]);
              } */

              // console.log('new userdata', $scope.userData);


              $scope.showMore = d.isMore;
              // console.log('showMore: ', $scope.showMore);
            }

          });
        };

      }
    };
  })
  .directive('listOfLists', function ($rootScope, dbFactory, $state, localStorageService, pltf) {
    return {
      restrict: 'E',
      templateUrl: 'directives/listOfLists.html',

      scope: {
        store: '@store',
        source: '@source',
        listsData: '=listsData'
      },
      controller: function ($scope, dbFactory, $state, pltf) {
        // First, load the lists.
        // console.log('listoflists: ', $scope);
        if (localStorageService.get('user' + $rootScope.user.userId + 'lists')) {
          $scope.listsData = localStorageService.get('user' + $rootScope.user.userId + 'lists');
        }
        // Now, call for this the local user's lists to be populated.
        dbFactory.promiseListOfLists($rootScope.user.userId).then(function (d) {
          $scope.listsData = d;
          // console.log('my lists?', $rootScope.user.userId, d);
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
  }).directive('chat', function ($rootScope, dbFactory, $state) {
    return {
      restrict: 'E',
      templateUrl: 'directives/chat.html',

      scope: {
        notificationsData: '=notificationsData'
      },
      controller: function ($scope, dbFactory, $state) {
        // Debug
        $scope.changeFilter = function (filterNew) {
          console.log('TEST', filterNew);
          $scope.filterChat = filterNew;
        };


        // TODO2 - This should be a global.
        // This is for the logged in user
        $scope.showUser = function (userId, userName, dataScope, fbuid) {
          console.log('controllers.js - showUser 87');
          // dbFactory.showUser(userId,userName, dataScope, fbuid);
          $state.go('app.profile', {
            userId: userId
          });
        };

        /* Link to List */
        $scope.showList = function (listId, listName, userFilter, focusTarget) {
          console.log('showList app.js 493');
          dbFactory.showAList(listId, listName, userFilter, focusTarget);
        };


        /* Thing */
        $scope.showThing = function (thingId, thingName, userFilter) {
          console.log('showThing');
          // dbFactory.showThing(thingId, thingName, userFilter);
          $state.go('app.thing', {
            thingId: thingId
          });
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
  });