'use strict';
angular.module('Services.facebook', [])

.factory('Facebook',[ '$rootScope', 'OAuth', 'dbFactory', function ( $rootScope, OAuth, dbFactory ) {
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
        	// $rootScope.session.plittoState = 'Checking your Facebook Status on this device.';
            // 
            // console.log('facebook factory login button was pressed.');
            /* The function that receives the broadcast is the first part of the controller Session. */
/*
        	$rootScope.$broadcast('fb_status','test line 25');
        	$rootScope.$broadcast('rootScope:broadcast',{nothing:'nothing'});
        	$rootScope.$emit('rootScope:emit',{nothing:'nothing'});
*/        	
            /* This function handles logging into Facebook, AND prompts for the popup if it's not authorized. */
              // console.log('Facebook responded');
// TODO1 - Where should this go?!?            OAuth.redirect();
            FB.getLoginStatus(function (response) {
                // REMOVED 10/31 $rootScope.session.plittoState = 'Facebook Responded';
              console.log('Facebook.login 39 - Facebook response for getLoginStatus: ', response , response.authResponse.accessToken);
              
              // If there is an access token, then we should pass that to the Plitto API for processing.
              if(response.authResponse.accessToken && response.status ==='connected'){
                // Ths user is logged in, and has authorized Plitto.
               dbFactory.fbTokenLogin(response.authResponse.accessToken);
                
              } else {
                console.log("FB.login - response wasn't 'connected'. ", response);
                
                // 
                // console.log('factory_facebook is got a response from "getLoginStatus: ',response);

                // Facebook will either be: connected, not_authorized, or unknown.
                  switch (response.status) {
                      case 'connected':
                          // console.log('28 -response.status is connected.');

                          // This isn't needed. $rootScope.$broadcast('fb_connected', {facebook_id:response.authResponse.userID});

                          /* If this works, we should be good to delete the line above. */

                          // $rootScope.session.plittoState = 'Facebook is connected. Waiting for Plitto';
                          // console.log('fb_connected 53',response,{facebook_id:response.authResponse.userID});
                          //$rootScope.$broadcast('fb_connected', {facebook_id:response.authResponse.userID});                        
                          // $rootScope.$broadcast('getLoginStatus',response);

                          /* Call out to Plitto from here */
                        console.log("You are connected, but without a token. This should never happen.");

                          break;
                      case 'not_authorized':
                          // TODO? Here, we should handle the authorization.
                          // console.log('factory_Facebook | The user pressed the button. | NOT AUTHORIZED.');

                          console.log('You will be prompted to add permissions in Facebook. Status: not_authorized.');

                          /* http://stackoverflow.com/questions/3834939/facebook-oauth-for-mobile-web */
                          // OAUTH SERVICE REDIRECT HERE
                          OAuth.redirect();

                          break;

                      case 'unknown':
                          console.log('Facebook Redirect. If you see this for long, go to plitto.com in Safari, Chrome, Opera, Firefox or Internet Explorer. status: unknown.');
                          // 
                          // console.log('32 -response.status is unknown.');
                          /*
                          FB.login(function (response) {
                              $rootScope.session.plittoState = 'Facebook Responded. You are not logged in.';
                              if (response.authResponse) {
                                  // The user is not authorized to facebook, but could be.
                                  $rootScope.$broadcast('fb_connected', {
                                      facebook_id:response.authResponse.userID,
                                      userNotAuthorized:true
                                  });
                              } else {
                                  $rootScope.$broadcast('fb_login_failed');
                                  $rootScope.session.plittoState = 'That Facebook Login Failed';
                              }
                          }, {scope:'email, user_friends'});
  */
                          // OAUTH SERVICE REDIRECT HERE
                          OAuth.redirect();
                          break;
                      default:
                          $rootScope.session.plittoState = 'Redirecting you to Facebook for authorization approval.';
                          // console.log('factory_Facebook.login = Default. FB.login about to be caled');
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
            $rootScope.session.plittoState = 'Facebook Remove Plitto Access Called.';
        	// 
            // console.log('facebook factory unsubsubscribe');
            FB.api("/me/permissions", "DELETE", function (response) {
                $rootScope.session.plittoState = 'Facebook Remove Plitto Access Succeeded';
                // $rootScope.$broadcast('fb_get_login_status');
                // console.log('FacebookAPI: unsubscribe response: ',response);
                $rootScope.$broadcast('fb_plitto_access_deleted');
            });

            
        }
    };
}]);
