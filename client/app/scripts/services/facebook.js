'use strict';
angular.module('Services.pFb', [])

.factory('pFb',[ '$rootScope', 'dbFactory','$state', function ( $rootScope, dbFactory, $state ) {
  // console.log('logged pFb');
  /* fbAsyncInit - This tracks whether the user is logged in */
  window.fbAsyncInit = function () {
    FB.init({
         appId:'207184820755',
        // appId: '10152399335865756',
        status: true,
        cookie: true,
        xfbml      : true,
        version    : 'v2.0',
        scope: 'email, user_likes'
      
    });

     /* Disabled 11/6/2014
    FB.Event.subscribe('auth.statusChange', function (response) {
      // At this point, we've received the element. We just need to broadcast it.

      // Do different things depending on the status
      // console.log('script.php | getLoginStatus | ',response.status);
      // REMOVED 10/31  $rootScope.session.plittoState='28 Facebook says you are' + response.status;
      if(response.status === 'not_authorized'){
        $rootScope.$broadcast("getLoginStatus", {
            'fbresponse': response
          });
      } else {
          $rootScope.$broadcast("getLoginStatus", {
            'fbresponse': response, 
            'userID': response.authResponse.userID});
        }
    });
    */
  };

  (function (d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));
  
  
	// Function to update the RootScope from anywhere.
  var apiPath = (window.cordova) ? 'http://plitto.com/api/2.0/' : '/api/2.0/';
  return {
    getLoginStatus:function () {
      // 
      console.log('50. facebook factory getLoginStatus');
      //  return { status: 'test status'};
      
      // This makes the Facebook API to Facebook. 
      FB.getLoginStatus(function ( response ) {
        
          // $rootScope.session.plittoState = 'Facebook Responded 7';
          // 
        console.log('fbFactory.getLoginStatus -> FB.getLoginStatus: This function is only called when requesting the status of the app on login, and when requesting more permissions..',response);
        // $rootScope.loginMessage = "Facebook needs to grant permissions. Open up the window.";
        
        $rootScope.$broadcast("getLoginStatus", { 'fbresponse' : null});  
        // TODO1 - This needs to work. A callback doesn't work with this function. It has to be a broadcast.
        $rootScope.$broadcast("getLoginStatus", { 'fbresponse' : response });
        
        
          // Update the status
          // $rootScope.session.fbState = response.status;
          // console.log('FB.getLoginStatus | fbState: ', response.status);

          // $rootScope.nav.fb_get_login_status = response.status;
          console.log('rootScope done broadcasting getLoginStatus {"fbresponse":>???}: ', response );
        });
    },
    login:function () {
      // console.log('Facebook login happening.');
      // TODO2 - As of 11/6/2014, this shouldn't ever be called.
      $rootScope.loginMessage =  "Redirecting you to login with Facebook's login process."
      // OAuth.redirect(); // Should we go straight to oAuth? This doesn't really do anything special.
      // 
      FB.login();
      // FB.init();
      
      // setTimeout(console.log('delay in facebook.login'),2000);

    },
    logout:function () {
      // REMOVED 10/31 $rootScope.session.plittoState = 'Logout Called.';
      // console.log('facebook factory logout');
    // TODO2 - It looks like this isn't working as part of the logout portion. Maybe we don't need it? 11/2014
      FB.logout(function (response) {
        // REMOVED 10/31 $rootScope.session.plittoState = 'Facebook Responded to logout.';
        if (response) {
            $rootScope.$broadcast('fb_logout_succeded');
        } else {
            $rootScope.$broadcast('fb_logout_failed');
        }
      });
    },
    deleteFBaccess:function () {
      console.log('Remove Plitto from Facebook Account');

      $rootScope.token = '';
      dbFactory.dbInit();
      // 
      // console.log('facebook factory unsubsubscribe');
      FB.api("/v2.2/me/permissions", "DELETE", function (response) {
        console.log('Facebook Unsbscribe Plitto Succeeded');
        $rootScope.token = null;
        dbFactory.init();
        
        // TODO2 - Clean this up.
        // $rootScope.session.plittoState = 'Facebook Remove Plitto Access Succeeded';
        // $rootScope.$broadcast('fb_get_login_status');
        // console.log('FacebookAPI: unsubscribe response: ',response);
        // $rootScope.$broadcast('fb_plitto_access_deleted');
      });


    }
  };
}]);
