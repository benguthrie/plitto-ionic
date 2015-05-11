'use strict';
angular.module('loginController', [])
  .controller('LoginCtrl', function ($scope, $window, $rootScope, $state) {


    $scope.loginOAuth = function (provider) {
      $rootScope.loginMessage = '1. loginOAuth Pressed';

      // TODO1 - This is the bit that handles the login.
      if (provider === 'facebook') {

        // Do that.
        /* RETURN 1/19/2015 */
        $rootScope.loginMessage = '1. Facebook loginOAuth Initiated';
        // Go to controllers.26
        $rootScope.$broadcast('broadcast', {
          command: 'login',
          platform: 'facebook',
          debug: 'controller.js 506 login with facebook.'
        });

        $state.go('loading'); // TODO 1 - Is this working?
        // Facebook.login();

      } else {
        $rootScope.loginMessage = '2. END - Unknown OAuth Provider';

      }
      // $window.location.href = '/auth/' + provider;
    };
  });