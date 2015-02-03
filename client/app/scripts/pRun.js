'use strict';
angular.module('pRun', [])
  .run(function ($ionicPlatform, $rootScope, dbFactory, OAuth, $state, pltf, localStorageService, $location) {
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
      if (window.cordova && window.cordova.plugins.Keyboard) {
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

          dbFactory.refreshData($rootScope.token).then(function (d) {
            console.log('controller.initCallback 88 --> refreshData response: ', d);
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

  });