'use strict';
angular.module('Services.oauth', [])

.service('OAuth', function ($window, $rootScope, $state, $timeout) {
  // Need to change redirect from plitto.com if on mobile
  // otherwise we're just going to load the entire website on the phone
  // console.log('window: ',window);
  var redirect_uri = window.cordova ? 'http://plitto.com' : 'http://plitto.com';
  
  // This is the only place that controlls the navigation based on the token's presence.
  $rootScope.$watch('token',function(){
    
    $rootScope.debug('oauth13: rootScope token changed: ' + $rootScope.token);
    // If token is loading, go to loading screen.
    if(typeof ($rootScope.token) === 'string' && $rootScope.token ==='loading'){
      $state.go('loading');
    } else if (typeof ($rootScope.token) === 'string' && $rootScope.token.length > 0){
      // We will assume that the token is valid TODO1 - Test it.
      $state.go('app.home');
      // $location.path('/login');
    } else {
      $state.go('login');
    }
  });
  
  
  // TODO 11/2/2014 - This might not be used.
  var authUrl ='http://www.facebook.com/dialog/oauth?'
    + 'client_id=207184820755'
    + '&redirect_uri=' + redirect_uri
    + '&display=touch'
    + '&scope=email,user_friends'
    + '&response_type=token'
  ;
  var authWindow = null;

  // Function that is called with auth code and redirect home
  /* */
  var authFinished = function (code) {
    console.log('Got this code: ' + code);
    console.log('Now what? Think a post to plitto.com has to happen');
    $window.location = '#/app/home';
    // $rootScope.token = "807cfa6f392685f6d1131082d9a42276"; // Diego's hard coded token.
    $rootScope.token = code;
  };
  

  // Event handler for the inAppBrowser plugin's `loadstart` event
  var loadstart = function (e) {
    $rootScope.message = $rootScope.message + ' <br/>oauth loadstart.';
    
    console.log(e.url);
    // TODO: HANDLE ERROR (if user denies access)
    // Form: error=access_denied&error_code=200&error_description=Permissions+error&error_reason=user_denied
    var code = /\?code=(.+)$/.exec(e.url);
    var error = /\?error=(.+)$/.exec(e.url);

    if (code || error) {
      authWindow.close();
      authFinished(code); 

      $timeout(function () {
        authWindow.close();
        authFinished(code);
      }, 300);
    }
  };

  this.redirect = function () {
    $rootScope.message = $rootScope.message + ' <br/>oauth redirect.';
    if (window.cordova) {
      console.log('Redirecting for mobile: ' + authUrl);
      authWindow = $window.open(authUrl, '_blank', 'location=no,toolbar=no');
      authWindow.addEventListener('loadstart', loadstart);
    } else {
      // $window.location = authUrl;
      console.log('OAuth - Web Redirect for web clients', authUrl, redirect_uri);
      console.log('Redirecting for web');
      $window.location = authUrl;
    }
  };
});
