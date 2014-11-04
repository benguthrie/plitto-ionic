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

     /*
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
          console.log('Facebook login happening.');
          $rootScope.message = $rootScope.message + ' 65 - facebook.login called';
          OAuth.redirect(); // Should we go straight to oAuth? This doesn't really do anything special.
          
          // setTimeout(console.log('delay in facebook.login'),2000);
/*
        	$rootScope.$broadcast('fb_status','test line 25');
        	$rootScope.$broadcast('rootScope:broadcast',{nothing:'nothing'});
        	$rootScope.$emit('rootScope:emit',{nothing:'nothing'});
*/        	
            /* This function handles logging into Facebook, AND prompts for the popup if it's not authorized. */
              // console.log('Facebook responded');
          
/*          
// TODO1 - Where should this go?!?            
            FB.getLoginStatus(function (response) {
              $rootScope.message = $rootScope.message + ' 83! - facebook.getLoginStatus:' + response.status + " <--";
                // REMOVED 10/31 $rootScope.session.plittoState = 'Facebook Responded';
              // console.log('Facebook.login 39 - Facebook response for getLoginStatus: ', response );
              
              // If there is an access token, then we should pass that to the Plitto API for processing.
              if( response.authResponse !== null && typeof response.authResponse.accessToken !== 'undefined' && response.status ==='connected'){
                // Ths user is logged in, and has authorized Plitto.
                console.log('plittoFacebook45: connected, with a token.');
                $rootScope.message = $rootScope.message + ' Login from Fb Token: ' + response.authResponse.accessToken;
                
                dbFactory.fbTokenLogin(response.authResponse.accessToken);
                
              } else {
                console.log("FB.login - response wasn't 'connected'. ", response);
                
                // 
                // console.log('factory_facebook is got a response from "getLoginStatus: ',response);

                // Facebook will either be: connected, not_authorized, or unknown.
                  switch (response.status) {
                      case 'connected':
                        // Facebook had responded, and you're connected.
                        console.log("You are connected, but without a token. This should never happen.");
                        $rootScope.message = $rootScope.message + ' <br/>facebook connected. Should not happen 105.';
                        break;
                      case 'not_authorized':
                        // TODO? Here, we should handle the authorization.
                        // console.log('factory_Facebook | The user pressed the button. | NOT AUTHORIZED.');
                        $rootScope.message = $rootScope.message + ' <br/>facebook.login: not_authorized.';
                        console.log('You will be prompted to add permissions in Facebook. Status: not_authorized.');

                        // http://stackoverflow.com/questions/3834939/facebook-oauth-for-mobile-web 
                        // OAUTH SERVICE REDIRECT HERE
                        OAuth.redirect();

                        break;

                      case 'unknown':
                        $rootScope.message = $rootScope.message + ' <br/>facebook.login: unknown';
                        console.log('Facebook Redirect. If you see this for long, go to plitto.com in Safari, Chrome, Opera, Firefox or Internet Explorer. status: unknown.');

                        // OAUTH SERVICE REDIRECT HERE
                        OAuth.redirect();
                        break;
                      default:
                        $rootScope.message = $rootScope.message + ' <br/>facebook.login default - Get more permissions..';
                        $rootScope.session.plittoState = 'Redirecting you to Facebook for authorization approval.';
                          // 
                        console.log('factory_Facebook.login = Default. FB.login about to be called again after getting permissions. Line 113.');
                        FB.login(function (response) {
                            if (response.authResponse) {

                                $rootScope.$broadcast('fb_connected', {facebook_id:response.authResponse.userID});
                                $rootScope.$broadcast('fb_get_login_status');
                            } else {
                                $rootScope.$broadcast('fb_login_failed');
                            }
                        });
                        break;
                  }
                }
            }, true);

            // Wasn't working at 12:39 TODO1 - Do we need to call this again?
            // getLoginStatus();
            */
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
            $rootScope.init();
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
