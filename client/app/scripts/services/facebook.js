'use strict';
angular.module('Services.facebook', [])

.factory('Facebook',[ '$rootScope', 'OAuth', 'dbFactory','$state', function ( $rootScope, OAuth, dbFactory, $state ) {
   
  window.fbAsyncInit = function () {
    FB.init({
         appId:'207184820755',
        // appId: '10152399335865756',
        status: true,
        cookie: true,
        xfbml      : true,
        version    : 'v2.0'
    });

     /* Disabled 11/6/2014
    FB.Event.subscribe('auth.statusChange', function (response) {
      // At this point, we've received the element. We just need to broadcast it.

      // Do different things depending on the status
      // console.log('script.php | getLoginStatus | ',response.status);
      // REMOVED 10/31  $rootScope.session.plittoState='28 Facebook says you are' + response.status;
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
        	// console.log('facebook factory getLoginStatus');
            FB.getLoginStatus(function (response) {
                // $rootScope.session.plittoState = 'Facebook Responded 7';
                // 
              console.log('fbFactory.getLoginStatus -> FB.getLoginStatus: This function is only called when requesting permissions.',response);

              // TODO1 - This was deactivated on 10/31.
                // $rootScope.$broadcast("getLoginStatus", {'status':response.status});
                // Update the status
                // $rootScope.session.fbState = response.status;
                // console.log('FB.getLoginStatus | fbState: ', response.status);

                // $rootScope.nav.fb_get_login_status = response.status;
            }, true);
        },
        login:function () {
          // console.log('Facebook login happening.');
          // TODO2 - As of 11/6/2014, this shouldn't ever be called.
          $rootScope.message = $rootScope.message + ' 65 - facebook.login called';
          OAuth.redirect(); // Should we go straight to oAuth? This doesn't really do anything special.
          
          // setTimeout(console.log('delay in facebook.login'),2000);

        },
        logout:function () {
            // REMOVED 10/31 $rootScope.session.plittoState = 'Logout Called.';
        	// console.log('facebook factory logout');
            FB.logout(function (response) {
                // REMOVED 10/31 $rootScope.session.plittoState = 'Facebook Responded to logout.';
                if (response) {
                    $rootScope.$broadcast('fb_logout_succeded');
                } else {
                    $rootScope.$broadcast('fb_logout_failed');
                }
            });
        },
        unsubscribe:function () {
            console.log('Remove Plitto from Facebook Account');
            
            $rootScope.token = '';
            dbFactory.dbInit();
        	// 
            // console.log('facebook factory unsubsubscribe');
            FB.api("/me/permissions", "DELETE", function (response) {
                console.log('Facebook Unsbscribe Plitto Succeeded');
                $rootScope.session.plittoState = 'Facebook Remove Plitto Access Succeeded';
                // $rootScope.$broadcast('fb_get_login_status');
                // console.log('FacebookAPI: unsubscribe response: ',response);
                $rootScope.$broadcast('fb_plitto_access_deleted');
            });

            
        }
    };
}]);
