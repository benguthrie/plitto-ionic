'use strict';
angular.module('Services.facebook', [])

.factory('Facebook',[ '$rootScope', 'OAuth', function ($rootScope, OAuth) {
	// Function to update the RootScope from anywhere.

    return {
        getLoginStatus:function () {
        	// console.log('facebook factory getLoginStatus');
            FB.getLoginStatus(function (response) {
                $rootScope.session.plittoState = 'Facebook Responded 7';
            	// This function is only called when requesting permissions.
                // console.log('fbFactory.getLoginStatus -> FB.getLoginStatus: ',response);

                $rootScope.$broadcast("getLoginStatus", {'status':response.status});
                // Update the status
                $rootScope.session.fbState = response.status;
                // console.log('FB.getLoginStatus | fbState: ', response.status);

                $rootScope.nav.fb_get_login_status = response.status;
            }, true);
        },
        login:function () {
        	$rootScope.session.plittoState = 'Checking your Facebook Status on this device.';
            // 
            // console.log('facebook factory login button was pressed.');
            /* The function that receives the broadcast is the first part of the controller Session. */
/*
        	$rootScope.$broadcast('fb_status','test line 25');
        	$rootScope.$broadcast('rootScope:broadcast',{nothing:'nothing'});
        	$rootScope.$emit('rootScope:emit',{nothing:'nothing'});
*/        	
            /* This function handles logging into Facebook, AND prompts for the popup if it's not authorized. */
              console.log('Facebook responded');
              OAuth.redirect();
            FB.getLoginStatus(function (response) {
            	// 
                $rootScope.session.plittoState = 'Facebook Responded';
                // 
                // console.log('factory_facebook is got a response from "getLoginStatus: ',response);

            	// At this point, the RootScope is no longer updated.
        		// $rootScope.nav.filter = 'line 21' + response.status;
        		
                /* Broadcast that status. TODO2 - Hide this? */
        		// $rootScope.$broadcast('21status',response.status);
        		// console.log('24 Result of FB.getLoginStatus',response.status);

                /* Take Different actions based on the response -  */
                // console.log('switched Response: ',response.status);
                switch (response.status) {
                    case 'connected':
                    	// console.log('28 -response.status is connected.');
                        
                        // This isn't needed. $rootScope.$broadcast('fb_connected', {facebook_id:response.authResponse.userID});

                        /* If this works, we should be good to delete the line above. */

                        $rootScope.session.plittoState = 'Facebook is connected. Waiting for Plitto';
                        // console.log('fb_connected 53',response,{facebook_id:response.authResponse.userID});
                        //$rootScope.$broadcast('fb_connected', {facebook_id:response.authResponse.userID});                        
                        $rootScope.$broadcast('getLoginStatus',response);

                        /* Call out to Plitto from here */

                        break;
                    case 'not_authorized':
                        // TODO? Here, we should handle the authorization.
                        // console.log('factory_Facebook | The user pressed the button. | NOT AUTHORIZED.');

                        $rootScope.session.plittoState = 'You will be prompted to add permissions in Facebook';
                    
                        /* http://stackoverflow.com/questions/3834939/facebook-oauth-for-mobile-web */
                        // OAUTH SERVICE REDIRECT HERE
                        OAuth.redirect();

                        break;

                    case 'unknown':
                        $rootScope.session.plittoState = 'Facebook Redirect. If you see this for long, go to plitto.com in Safari, Chrome, Opera, Firefox or Internet Explorer.';
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
                        $rootScope.session.plittoState = 'Redirecting you to Facebook';
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
            }, true);

            // Wasn't working at 12:39 TODO1 - Do we need to call this again?
            // getLoginStatus();
        },
        logout:function () {
            $rootScope.session.plittoState = 'Logout Called.';
        	// console.log('facebook factory logout');
            FB.logout(function (response) {
                $rootScope.session.plittoState = 'Facebook Responded to logout.';
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
