'use strict';
angular.module('viewConfig', [])
  .config(function ($stateProvider, $urlRouterProvider, $httpProvider, $ionicConfigProvider, pltf) {
    $ionicConfigProvider.views.maxCache(0);

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
          controller: 'pctrl'
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
    })

    ;

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