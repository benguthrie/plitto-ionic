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

.run(function ($ionicPlatform, $rootScope, dbFactory,  OAuth, $state) {
  
  // Check to see if Facebook is giving us a code to use in the URL.
  if(QueryString.code){
    // Make the Plitto API call
    console.log('RUN URL because we found it.', QueryString.code);
    
    // TODO1 - Put this backdbFactory.fbTokenLogin(QueryString.code);
  }
  
  

    
  $ionicPlatform.ready(function () { 
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    // Get the access token from Facebook.
    if ( window.location.hash.indexOf("access_token") !== -1){
      console.log("Found the token.", window.location.hash, window.location.hash.indexOf("access_token") );
      // TODO1 - Show a loading indicator
    
      var hash = window.location.hash;

      var accessToken = hash.substring( hash.indexOf('access_token=') + "access_token=".length , hash.indexOf('&') ) ;
      console.log('at: ', accessToken);

      // Use this to make the call to login.
      dbFactory.fbTokenLogin(accessToken);
    }
  
    
  });
})

.config(function ($stateProvider, $urlRouterProvider, $httpProvider) {
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
        'menuContent' :{
          templateUrl: 'templates/home.html',
          controller: 'HomeCtrl'
        }
      }
    })
  
  .state('loading',{
    url:'/loading',
    templateUrl: 'templates/loading.html',
    controller: 'LoadingCtrl'
  })
  
  
  
   .state('app.search', {
      url: '/search/',
      views: {
        'menuContent': {
          templateUrl: 'templates/search.html',
          controller: 'SearchCtrl'
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
        'menuContent' :{
          templateUrl: 'templates/chat.html',
          controller: 'chatCtrl'
        }
      }
    })
  
    .state('app.debug', {
      url: '/debug',
      views: {
        'menuContent' :{
          templateUrl: 'templates/debug.html',
          controller: 'DebugCtrl'
        }
      }
    })
  
    .state('app.addlist', {
      url: '/addlist',
      views: {
        'menuContent' :{
          templateUrl: 'templates/add-list.html',
          controller: 'addListCtrl'
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
  
    .state('app.thing', {
      url: '/thing',
      views: {
        'menuContent' :{
          templateUrl: 'templates/thing.html',
          controller: 'ThingCtrl'
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
  
  $urlRouterProvider.otherwise("/home"); // Added 12.19.2014
  
  // if none of the above states are matched, use this as the fallback
// TODO1 - Do this. $urlRouterProvider.otherwise('/app/home');
  if(QueryString.access_token){
    console.log('found querystring access token.', QueryString.access_token);
  
  }
  else {
    console.log("Didn't find it.", QueryString.access_token, window.location.hash );
    // console.log("REPLACeD", window.location.hash.replace("#/",""));
  
  //http://localhost/plitto-ionic/client/app/?#/access_token=CAAAAMD0tehMBAMUwibZCHQrzYS3v6QdLKTsIlWveB7CTSV0ZByuItJP8u7tF3xaYjGBNjeT7BDRjVWA9WwwelEjMAZCiKgi9C5dDIAUfZAUwdqPQlxxDbykoslmJs8OhyNRpXEoU0o6fC2eiYMROqOLvW8C1A0NU72YBmgcWitSom8Yw0rdEQCLktU6t1xdePnNKLLq75dlANujWVRvgcsgIuZCjZAZC9IZD&expires_in=6952

    // TODO1 - Put this back $urlRouterProvider.otherwise('/app/home');
  }
  

  // Handle 401 Unauthorized responses
  $httpProvider.interceptors.push(function ($q, $location) {
    return {
      responseError: function (rejection) {
        if (rejection.status == 401) {
          $location.path('/login');
        }
        return $q.reject(rejection);
      }
    };
   });
  
})
.directive('userNav', function ($rootScope, dbFactory, $state) {
 return {
    restrict: "E",
    // templateUrl: 'directives/userNav.html',
    template: '<ion-nav-bar>  ' + 
      '<ion-nav-buttons side="left"> <button menu-toggle="left" class="button button-icon ion-navicon"></button> </ion-nav-buttons> ' + 
      '<ion-nav-buttons side="secondary"> ' + 
        ' <button class="button button-icon  ionicons ion-plus-circled" ng-click=" navFunc(\'addlist\'); "></button> ' + 
        ' <button class="button button-icon ion-chatbox" ng-click="navFunc(\'chat\');"> ' + 
          ' <span class="innerNo" ng-bind="$root.stats.alertCount"></style></button>  ' + 
        ' <button class="button button-icon iconDice" ng-click="navFunc(\'home\'); getSome();"></button> ' +
        ' <button class="button button-icon ion-search" ng-click="navFunc(\'search\');" > </button> '+
      '</ion-nav-buttons></ion-nav-bar>',
   // template: '<ion-nav-bar><ion-nav-buttons side="left"><button menu-toggle="left" class="button button-icon icon ion-navicon"></button></ion-nav-buttons></ion-nav-bar>',
    // scope: {}
    controller: function($scope, dbFactory, $state){
      // Reload the navigation
      // dbFactory.userChat(-1);
  
      // Load the notifications
      $scope.navFunc = function(path){
        console.log("navFunc");
  
        if (path === "chat") {
          dbFactory.updateCounts();
        }
        
        $state.go("app." + path);
        
        dbFactory.userChat(-1).then(function(response){
          $rootScope.stats.feed = response;
        });
      };
  
    }
  }; 
})
  
.directive('userListThing', function($rootScope, dbFactory, $state) {
  return {
    restrict: 'E',
    templateUrl: 'directives/userListThing.html',
    
    scope: {
      store: '@store',
      source: '@source',
      userData: '=userData'
    },
    controller: function($scope, dbFactory, $state) {
      /* Ditto */
      $scope.ditto = function(mykey, uid, lid, tid, $event,scopeName){
        dbFactory.dbDitto(scopeName,mykey,uid,lid,tid, $event);
      };
  
      /* User */
      $scope.showUser = function(userId, userName, dataScope, fbuid){
        dbFactory.showUser(userId,userName, dataScope, fbuid);
      }; 
  
      /* List */
      $scope.showList = function(listId, listName, userFilter){
        dbFactory.showAList(listId, listName, userFilter);
      };
  
      /* Thing */
      $scope.showThing = function(thingId, thingName, userFilter){
        dbFactory.showThing(thingId, thingName, userFilter);
      };
  
      /* Let's Chat
      letsChat(userData.uid, list.lid, item.tid, $event, store); " */
      $scope.letsChat = function(uid, lid, tid, $event, store, $index){
        console.log('letsChat app.js directive', uid, lid, tid, $event, store, $index);
  var length = eval("$rootScope." + store + ".length");
        var tempStore = eval("$rootScope." + store);
  
        console.log('tempStore: ', tempStore);
        
  // Get the user ID number.
        var upos = null;
        var lpos = null;
        var tpos = null;
  
        console.log('tempstore', tempStore);
  
        for (var j in tempStore){
          console.log('j: ',j);
          console.log(tempStore[j].uid);
          console.log('Equal? ', tempStore[j].uid === uid);
          if(tempStore[j].uid === uid){
            var upos = j;
            break;  
          }
        }
        
        for ( var k in tempStore[upos].lists ) {
          if(tempStore[upos].lists[k].lid === lid ) {
            var lpos = k;
            break;
          }
        }

        for ( var l in tempStore[upos].lists[lpos].items ) {
          if( tempStore[upos].lists[lpos].items[l].tid === tid ) {
            var tpos = l;
          }
        }
        
        console.log('upos: ', upos, lpos, tpos, $rootScope.user);


        var isActive = 1;
        if($($event.target).hasClass("active")){
          // User is removing this from their chat queue.
          var isActive = 0;
          $($event.target).removeClass("active");
          $("div#comments" + uid + lid + tid).hide();
          eval("$rootScope." + store + "[" + upos +"].lists["+ lpos + "].items[" + tpos + "].commentActive = null; "  );
        } else {
          
          $($event.target).addClass("active");
          $("div#comments" + uid + lid + tid).show();
          eval("$rootScope." + store + "[" + upos +"].lists["+ lpos + "].items[" + tpos + "].commentActive = \"1\"; "  );
          
        }
        // Call the addComment bit to activate or deactivate the queue item
        dbFactory.addComment ( uid, lid, tid, "0", isActive );
        console.log("commentactive:  ",
          eval("$rootScope." + store + "[" + upos +"].lists["+ lpos + "].items[" + tpos + "].commentActive; "  ) 
        );
      };
  
      $scope.makeItemComment = function (newComment, uid, lid, tid, store, $index){
        console.log("makeItemComment", newComment, uid, lid, tid, store, $index);
        // Find the user, then the list, then use the index.
        var length = eval("$rootScope." + store + ".length");
        var tempStore = eval("$rootScope." + store);
  
        console.log('tempStore: ', tempStore);
        
  // Get the user ID number.
        var upos = null;
        var lpos = null;
        var tpos = null;
  
        console.log('tempstore', tempStore);
  
        for (var j in tempStore){
          console.log('j: ',j);
          console.log(tempStore[j].uid);
          console.log('Equal? ', tempStore[j].uid === uid);
          if(tempStore[j].uid === uid){
            var upos = j;
            break;  
          }
        }
        
        for ( var k in tempStore[upos].lists ) {
          if(tempStore[upos].lists[k].lid === lid ) {
            var lpos = k;
            break;
          }
        }

        for ( var l in tempStore[upos].lists[lpos].items ) {
          if( tempStore[upos].lists[lpos].items[l].tid === tid ) {
            var tpos = l;
          }
        }
        
        console.log('upos: ', upos, lpos, tpos, $rootScope.user);
  
        // Add it to the UI / Scope (only if it exists)
        eval("$rootScope." + store + "[" + upos +"].lists["+ lpos + "].items[" + tpos + "].commentText = \"" + newComment + "\"; "  );

        // submit it to the database
        dbFactory.addComment ( uid, lid, tid, newComment, "1");

        // TODO1 Clear the comment field
        
        
      };
  
    }
  };
}).directive('listOfLists', function($rootScope, dbFactory, $state) {
  return {
    restrict: 'E',
    templateUrl: 'directives/listOfLists.html',
    
    scope: {
      store: '@store',
      source: '@source',
      listsData: '=listsData'
    },
    controller: function($scope, dbFactory, $state) {
      /* Link to List */
      $scope.showList = function(listId, listName, userFilter){
        
        dbFactory.showAList(listId, listName, userFilter);
      };
  
      /* Load up the lists 
       $scope.loadLists = function(){
         // user.userId is hard coded in lists, because it's always going to be this user's lists.
          dbFactory.getUserListOfLists($rootScope.user.userId,'$rootScope.lists');
        };
      */

      
    }
  };
}).directive('chat', function($rootScope, dbFactory, $state ) {
  return {
    restrict: 'E',
    templateUrl: 'directives/chat.html',
    
    scope: {
      notificationsData: '=notificationsData'
    },
    controller: function ( $scope, dbFactory, $state ) {
      // Debug
      $scope.changeFilter = function( filterNew ){
        console.log("TEST", filterNew );
        $scope.filterChat = filterNew;
      };
      
      // $scope.filterChatOptions = [ { filter: "them", selected: true }, { filter: "us", selected: false }, { filter: "me", selected: false } ];
      $scope.filterChatOptions = [ {show: "Them", value: "them" } , {show: "Us", value: "us"}, { show: "Me", value: "me" } ];
      $scope.filterChat = $scope.filterChatOptions[0];
    }
  };
});

