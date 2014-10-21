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
])

.run(function($ionicPlatform, $rootScope, dbFactory, Facebook) {
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
  
  // Initialize rootScope usage. If this was a service we wouldn't need to do this!
  // TODO: Refactor candidate
  $rootScope.session = {
    plittoState: {}
  };
  
  // Function to update the RootScope from anywhere.
  $rootScope.$on('fb_status', function(event,data){
    // console.log('sessionController: test fb_status lin 9',event, data);
    $rootScope.fb_status = 'test line 9 succedded';
  });

  $rootScope.$on('rootScope:emit', function(event,data){
    // 
    // console.log('sessionController: rootScope emitted to controller session: ',event, data);
  });

  $rootScope.$on('getLoginStatus', function(event,data){
    // console.log('sessionController:  sniffed status change from fbFactory getLoginStatus OR From APP run.: ',event, data.status);
    // console.log('session.getLoginStatus. Do things based on the Facebook login.',event, data.status);

    $rootScope.session.fbState = data.status;

    // This change is not making it to the dom, for some reason, but the console is working fine.
    // If the data.status === 'connected' then handle the login


    if(data.status === 'connected'){
      /* The user is logged into Facebook. Get their Facebook information for Plitto login */
      // console.log('process the login');
      FB.api('/me', function(meResponse) {
        // 
        // console.log('sessionController called FB.api/me | response: ',response);


        if(!meResponse.email || !meResponse.name || !meResponse.id){
          /* Request More information */
          $rootScope.session.plittoState = 'Need more permissions from Facebook, like your email or name.';
          // console.log('SessionController | Login failed. We need more information');
          /* Call this to go get more information about this user */
             /* http://stackoverflow.com/questions/3834939/facebook-oauth-for-mobile-web */
                  document.location='http://www.facebook.com/dialog/oauth?client_id=' 
                    + '207184820755&redirect_uri=http://plitto.com'
                   //   + '10152399335865756&redirect_uri=http://localhost/plitto-angular'
                  // + '/'
                      + '&display=touch'
                       // + ' &state=' + app_data
                       + '&scope=email,user_friends'
                       ;


        } else {
          // Reset the navigation variables.
          // console.log('Logging into Plitto Now.');
          $rootScope.session.plittoState = 'Logging into Plitto';
          /* While that's happening, let's set up the user and the interface */

        $rootScope.modal = {
          show: false, listStore: [], friendStore: [], thingStore: [], header: null
        };


          // Call the Facebook Friends 
            // Insert the request for FB Friends here first.
            FB.api('me/friends', function(friendsResponse){
              console.log("fb response to friends: ",friendsResponse);

              // A this point, NOW we can log into Plitto. One call with my info, and friend info.
              dbFactory.plittoLogin(meResponse, friendsResponse);	
            });
          /*
          // Here, handle the plitto login.
        dbFactory.plittoLogin(response);	
        */

        }


      });


    } else if (data.status ==='not_authorized'){
      // console.log('sessionController. User is logged into facebook, but has "not_authorized". Do not take action here. Let them press the button.');

    } else {
      // This person is not logged into Facebook, so that should be handled too.
      // console.log('sessionController: You are not logged into Facebook.')
    }
  });
  
  // Perform Facebook JS SKD Authentication
  window.fbAsyncInit = function () {
    FB.init({
         appId:'207184820755',
        // appId: '10152399335865756',
        status:true,
        cookie:true,
        xfbml      : true,
        version    : 'v2.0'
    });

    FB.Event.subscribe('auth.statusChange', function(response) {
      // At this point, we've received the element. We just need to broadcast it.

      // Do different things depending on the status
      // console.log('script.php | getLoginStatus | ',response.status);
      $rootScope.session.plittoState='28 Facebook says you are' + response.status;
      if(response.status === 'not_authorized'){
        $rootScope.$broadcast("getLoginStatus", {
            'status': response.status
          });
      } else {
          $rootScope.$broadcast("getLoginStatus", {
            'status': response.status, 
            'userID': response.authResponse.userID});
        }
    });
  };

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));
})

.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
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

