'use strict';
// Ionic Starter App, v0.9.20

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('Plitto', [
  'ionic',
  'config',
  'ngResource',
  'lbServices',
  'Plitto.controllers',
  'Plitto.services'
])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($httpProvider) {
})

.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
  $stateProvider

    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl'
    })

    .state('authCallback', {
      url: '/login/callback?access_token&userId',
      templateUrl: 'templates/login-callback.html',
      controller: 'LoginCallbackCtrl'
    })

    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'AppCtrl'
    })

    .state('app.profile', {
      url: '/profile',
      views: {
        'menuContent': {
          templateUrl: 'templates/profile.html',
          controller: 'ProfileCtrl'
        }
      }
    })

    .state('app.lists', {
      url: '/lists',
      views: {
        'menuContent' :{
          templateUrl: 'templates/lists.html',
          controller: 'ListsCtrl'
        }
      }
    })

    .state('app.list', {
      url: '/lists/:listId',
      views: {
        'menuContent' :{
          templateUrl: 'templates/list.html',
          controller: 'ListCtrl'
        }
      }
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/lists');

  // Handle 401 Unauthorized responses
  $httpProvider.interceptors.push(function($q, $location) {
    return {
      responseError: function(rejection) {
        if (rejection.status == 401) {
          $location.path('/login');
        }
        return $q.reject(rejection);
      }
    };
  });
});

