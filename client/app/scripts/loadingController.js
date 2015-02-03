angular.module('loadingController', [])
  .controller('LoadingCtrl', function ($scope, $rootScope, pltf) {

    // Control for thing goes here.
    $scope.thetoken = $rootScope.token;
    // $rootScope.debug('loadingctrl loaded');

    /* When this screen loads, if there is a token, go home. */
    if (typeof $rootScope.token === 'string' && $rootScope.token !== 'loading') {
      // console.log('Controllers 259 Done loading. Go home.');
      $rootScope.$broadcast('broadcast', {
        command: 'state',
        path: 'app.home',
        debug: 'Controllers.js 260. Go home.'
      });
    }

    $scope.showToken = function () {
      // $rootScope.debug('LoadingCtrl showToken');

      $scope.thetoken = $rootScope.token;
    };

    $scope.clearToken = function () {
      // $rootScope.debug('LoadingCtrl clearToken');
      $rootScope.token = '';

      $scope.thetoken = 'cleared!';
    };

    $scope.setToken = function () {
      // $rootScope.debug('LoadingCtrl setToken to 35358a19f081483800da33f59635e86f');
      $rootScope.token = '35358a19f081483800da33f59635e86f';
      $scope.thetoken = '35358a19f081483800da33f59635e86f';
    };
  });