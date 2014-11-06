'use strict';
angular.module('Services.oauth', [])

.service('OAuth', function ($window, $rootScope, $state, $timeout, dbFactory) {
  
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
      $state.go('loading');
    } else if (typeof ($rootScope.token) === 'string' && $rootScope.token.length > 0){
      // We will assume that the token is valid TODO1 - Test it.
      $state.go('app.home');
      // $location.path('/login');
    } else {
      $state.go('login');
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
    
    $window.location = '#/app/home';
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

  this.login = function(oauthService) {
    if(oauthService === 'facebook'){
      $rootScope.message = "<h3>3. OAuth.login.Facebook Opened. Next: Initiate FB.</h3>";
      
      /* Cordova App: All Facebook Info gets routed through a window. */
      if (window.cordova) {
        var authUrl ='https://www.facebook.com/dialog/oauth?'
          + 'client_id=207184820755'
          + '&redirect_uri=' + 'http://plitto.com' // This is irrelevant, because the window should close as soon as the code is received.
          + '&display=touch'
          + '&scope=email,user_friends'
          + '&response_type=token'
        ;
        // var authWindow = null;
        $rootScope.message = "<h3>4. This is the cordova app version.</h3>";
        
        /* This opens the Facebook Authorization in a new window */
        
        authWindow = $window.open(authUrl, '_blank', 'location=no,toolbar=no');
        console.log('111authWindow: ',authWindow);
        authWindow.addEventListener('loadstart', loadstart);
        
      } 
      else {
        // This is for the web. For whatever reason, the FB. bit doesn't work in the cordova version.
        
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
            $rootScope.message = "<h3>END 5. Need Popup Window.</h3>";
          }
        }, true);
      }
    
      

    } else {
      $rootScope.message = "<h3>END 5. Unknown Service Requested</h3>";
    }
  };

  // Access the facebook platform through FB.??? calls.
 

  // Set the API path:
  var apiPath = (window.cordova) ? 'http://plitto.com/api/2.0/' : '/api/2.0/';
  
 
  
});
