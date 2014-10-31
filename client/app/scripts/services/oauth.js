'use strict';
angular.module('Services.oauth', [])

.service('OAuth', function ($window, $rootScope, $timeout) {
  // Need to change redirect from plitto.com if on mobile
  // otherwise we're just going to load the entire website on the phone
  var redirect_uri = window.cordova ? 'http://plitto.com' : 'http://plitto.com';
  var authUrl ='http://www.facebook.com/dialog/oauth?'
    + 'client_id=207184820755'
    + '&redirect_uri=' + redirect_uri
    + '&display=touch'
    + '&scope=email,user_friends';
  var authWindow = null;

  // Function that is called with auth code and redirect home
  var authFinished = function (code) {
    console.log('Got this code: ' + code);
    console.log('Now what? Think a post to plitto.com has to happen');
    $window.location = '#/app/home';
    $rootScope.token = "807cfa6f392685f6d1131082d9a42276";
  };

  // Event handler for the inAppBrowser plugin's `loadstart` event
  var loadstart = function (e) {
    console.log(e.url);
    // TODO: HANDLE ERROR (if user denies access)
    // Form: error=access_denied&error_code=200&error_description=Permissions+error&error_reason=user_denied
    var code = /\?code=(.+)$/.exec(e.url);
    var error = /\?error=(.+)$/.exec(e.url);

    if (code || error) {
      $timeout(function () {
        authWindow.close();
        authFinished(code);
      }, 300);
    }
  };

  this.redirect = function () {
    if (window.cordova) {
      console.log('Redirecting for mobile: ' + authUrl);
      authWindow = $window.open(authUrl, '_blank', 'location=no,toolbar=no');
      authWindow.addEventListener('loadstart', loadstart);
    } else {
      console.log('Redirecting for web');
      $window.location = authUrl;
    }
  };
});
