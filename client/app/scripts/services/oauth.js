'use strict';
angular.module('Services.oauth', [])

.service('OAuth', function ($window, $rootScope, $state, $timeout, dbFactory, $location ) {
  
  // Need to change redirect from plitto.com if on mobile
  // otherwise we're just going to load the entire website on the phone
  // console.log('window: ',window);
  
  if(document.URL.indexOf("localhost") > -1)
    {var redirect_uri = window.cordova ? 'http://plitto.com' : 'http://localhost/plitto-ionic/client/app/';}
  else
    {var redirect_uri = window.cordova ? 'http://plitto.com' : 'http://plitto.com/client/app/';}
  
  // Define the auth-window as an element within the whole scope.
  var authWindow = null;
  
  // This is the only place that controlls the navigation based on the token's presence.
  $rootScope.$watch('token',function(){
    
    $rootScope.debug('oauth13: rootScope token changed: ' + $rootScope.token);
    // If token is loading, go to loading screen.
    if(typeof ($rootScope.token) === 'string' && $rootScope.token ==='loading'){
      // $state.go('loading');
      $rootScope.$broadcast("broadcast",{ command: "state", path: "loading", debug: "oauth.25 token is 'loading'. Go there." } );
    } else if (typeof ($rootScope.token) === 'string' && $rootScope.token.length > 0){
      // We will assume that the token is valid TODO1 - Test it.
      $rootScope.$broadcast("broadcast",{ command: "state", path: "app.home", debug: "oauth.28 untested token. go to app.home." } );
      
      // $location.path('/login');
    } else {
      // TODO1 Add some more logic to this. $state.go("login");
      // If there is an access token, we can just wait.
      if ( window.location.hash.indexOf("access_token") !== -1){
        console.log('wait');
      }
      else {
        $rootScope.$broadcast("broadcast",{ command: "state", path: "login", debug: "oauth.33 No token. Login." } );  
      }
      
 
   }
  });
  
  // Function that is called with auth code and redirect home
  /* */
  var authFinished = function (fbToken) {
    console.log('Got this code: ' + fbToken);
    console.log('Now what? Think a post to plitto.com has to happen');
    
    // $rootScope.message = $rootScope.message + ' authFinishedCode: ' + code;
    // Turn the fbToken into the plitto login.
    dbFactory.fbTokenLogin(fbToken);
    
    // Close the auth window?
    console.log('authFinished wants to closed authWindow.');
    console.log('authWindow: ',authWindow);
    authWindow.close();
    
    
    // $rootScope.token = "807cfa6f392685f6d1131082d9a42276"; // Diego's hard coded token.
    
  };
  
  function getParameterByName(name, path) {
    var bettername = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var results = '';
    var regex = new RegExp("[\\?&]" + bettername + "=([^&#]*)"),
        results = regex.exec(path);
    console.log('getParameterByName: name: ',name,' bettername: ',bettername, ' path: ', path);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  } 

  // Event handler for the inAppBrowser plugin's `loadstart` event
  var loadstart = function (e) {
    $rootScope.message = "<h3>6. Loadstart Started</h3>";
    //console.log('6. Loadstart started');
    // console.log('this is the authwindow: ', authWindow);
    
    
   // console.log('e.url loadstart', e.url);
    // TODO1: HANDLE ERROR (if user denies access)
    // Form: error=access_denied&error_code=200&error_description=Permissions+error&error_reason=user_denied
  
    // Let's strip out the pound sign. 
    var fburlpath = e.url.replace('#','');
    
    var accessToken = getParameterByName('access_token',fburlpath);
    
    var fbError = getParameterByName('error',fburlpath);

    // The above should sniff the presense of an access token.
    
    if (accessToken || fbError) {
      // $rootScope.message = "<h3>7. Loadstart Code: "+ accessToken +"</h3>";
     // console.log('7. loadstart found a code');
      //console.log('7. loadstart code: ' + accessToken);
      // authWindow.close(); // do this inside authFinished code.
      authFinished(accessToken); 

      $timeout(function () {
        // authWindow.close();
        authFinished(accessToken);
      }, 300);
    } else {
      console.log('loadstart debug 72. No accessToken or error');
    }
  };
  
  this.deleteFBaccess = function() {
    console.log('oauth deleteFBaccess');
    
  }

  this.login = function(oauthService) {
    if(oauthService === 'facebook'){
      console.log('uauth facebook');
      $rootScope.message = "<h3>3. OAuth.login.Facebook (oauth.101) Opened. Next: Initiate FB.</h3>";
           /* Cordova App: All Facebook Info gets routed through a window. */
      if (window.cordova) {
        var authUrl ='https://www.facebook.com/v2.0/dialog/oauth?'
          + 'client_id=207184820755'
          + '&redirect_uri=' + redirect_uri // This is irrelevant, because the window should close as soon as the code is received.
          + '&display=touch'
          + '&scope=email,user_friends'
          + '&response_type=token'
        ;
        // var authWindow = null;
        $rootScope.message = "<h3>4. This is the cordova app version.</h3>";
        
        /* This opens the Facebook Authorization in a new window */
        
        authWindow = $window.open(authUrl, '_blank', 'location=no,toolbar=no');
        console.log('111authWindow: open this URL: ',authUrl);
        authWindow.addEventListener('loadstart', loadstart);
        
      } 
      else {
        // This is for the web. For whatever reason, the FB. bit doesn't work in the cordova version.
        
        var authUrl ='https://www.facebook.com/v2.0/dialog/oauth?'
          + 'client_id=207184820755'
          + '&redirect_uri=' + redirect_uri // This is irrelevant, because the window should close as soon as the code is received.
          + '&display=touch'
          + '&scope=email,user_friends'
          + '&response_type=token'
        ;
        // var authWindow = null;
        $rootScope.message = "<h3>4. This is the web app version. Redirect to Facebook for authorization.</h3>";
        
        // https://www.facebook.com/v2.0/dialog/oauth?client_id={app-id}&redirect_uri={redirect-uri} 
        
        // Redirect to Facebook for authorization
        $rootScope.$broadcast('broadcast', { 
          command: "redirect", path: authUrl, debug: "oauth.js 136 - Redirect to Facebook for oauth." 
        } );
        
        /* Check with Facebook to get this user's login status */
      
      }
      

    } else {
      $rootScope.message = "<h3>END 5.1. Unknown Service Requested</h3>";
    }
  };

  // Access the facebook platform through FB.??? calls.
 

  // Set the API path for the mobile app, and localhost:
  var apiPath = (window.cordova) ? 'http://plitto.com/api/2.0/' : '/api/2.0/';
  
 
  
});
