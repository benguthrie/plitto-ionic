'use strict';
angular.module('Services.oauth', [])

.service('OAuth', function ($window, $rootScope, $state, $timeout, dbFactory) {
  
  // Need to change redirect from plitto.com if on mobile
  // otherwise we're just going to load the entire website on the phone
  // console.log('window: ',window);
  var redirect_uri = window.cordova ? 'http://plitto.com' : 'http://localhost/plitto-ionic/client/app/';
  
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
  
  
  // TODO 11/2/2014 - This might not be used. TRY TO REMOVE IT.
  /*
  var authUrl ='http://www.facebook.com/dialog/oauth?'
    + 'client_id=207184820755'
    + '&redirect_uri=' + redirect_uri
    + '&display=touch'
    + '&scope=email,user_friends'
    + '&response_type=token'
  ;
  var authWindow = null;
  */ 

  // Function that is called with auth code and redirect home
  /* */
  var authFinished = function (code) {
    console.log('Got this code: ' + code);
    console.log('Now what? Think a post to plitto.com has to happen');
    $window.location = '#/app/home';
    // $rootScope.token = "807cfa6f392685f6d1131082d9a42276"; // Diego's hard coded token.
    $rootScope.message = $rootScope.message + ' authFinishedCode: ' + code;
    $rootScope.token = code;
  };
  

  // Event handler for the inAppBrowser plugin's `loadstart` event
  var loadstart = function (e) {
    $rootScope.message = $rootScope.message + ' <br/>oauth loadstart.';
    
    console.log('e.url loadstart', e.url);
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

  this.login = function(oauthService) {
    if(oauthService === 'facebook'){
      $rootScope.message = "<h3>3. OAuth.login.Facebook Opened. Next: Initiate FB.</h3>";
      
      if (window.cordova) {
        $rootScope.message = "<h3>4. This is the cordova app version.</h3>";
        
      } else {
        // This is for the web.
        FB.getLoginStatus(function (response) {
                // $rootScope.session.plittoState = 'Facebook Responded 7';
                // 
          $rootScope.message = "<h3>4. Facebook Responded.</h3>";
          if(response.status === 'connected'){
            $rootScope.message = "<h3>5. Facebook Says Connected</h3>";
            // Take the token and send it to Plitto for login.
            dbFactory.fbTokenLogin(response.authResponse.accessToken);

          } else {
            // Anything else will require the redirect into and out of Facebook.
            $rootScope.message = "<h3>END 5. Need Popup Wind</h3>";
          }
        }, true);
      }
    
      

    } else {
      $rootScope.message = "<h3>END 5. Unknown Service Requested</h3>";
    }
  };
  
  // This handles everything by opening up windows. We should replace this if possible.
  this.redirect = function () {
    console.log('called OAuth.redirect. Eliminate!');
    
    $rootScope.message = $rootScope.message + 'OAuth.redirect';
    
    if (window.cordova) {
      console.log('Redirecting for mobile: ' + authUrl);
      authWindow = $window.open(authUrl, '_blank', 'location=no,toolbar=no');
      authWindow.addEventListener('loadstart', loadstart);
    } else {
      // $window.location = authUrl;
      console.log('OAuth - Web Redirect for web clients', authUrl, redirect_uri);
      console.log('TODO Handle what happens here. Facebook should be verifying the user, because there is no valid token. Restore line 82, if we must.');
      $window.location = authUrl;
    }
  };
  
// From here down,  Created on 11/4 to eliminate facebook.js
  // Access the facebook platform through FB.??? calls.
  window.fbAsyncInit = function () {
    FB.init({
         appId:'207184820755',
        // appId: '10152399335865756',
        status: true,
        cookie: true,
        xfbml      : true,
        version    : 'v2.0'
    });
  };
  
  // Bring in the facebook SDK.
   (function (d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));

  // Set the API path:
  var apiPath = (window.cordova) ? 'http://plitto.com/api/2.0/' : '/api/2.0/';
  
 
  
});
