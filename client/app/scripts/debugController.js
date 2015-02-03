angular.module('debugController', [])
  .controller('DebugCtrl', function ($scope, dbFactory, $rootScope, localStorageService, $state, pltf) {

    // console.log('rootScope: ', $rootScope);
    $scope.localStorage = function (type) {
      if (type === 'get') {
        localStorageService.get('debugNote');
      } else if (type === 'set') {
        localStorageService.set('debugNote', 'The Current Unix Time is: ' + Date.now());
      }
      // console.log('test debug local Storage');
    };

    $scope.funny = function (type, $rootScope) {
      if (type === 'rootScope') {
        // $scope.funnyText = $rootScope.length;
        $scope.funnyText = 50;
      } else if (type === 'stateName') {
        $scope.funnyText = {
          'currentTime': Date.now(),
          'state.current.name': $state.current.name
        };
      } else if (type === 'querystring') {
        $scope.funnyText = 'querystring!';

        pltf.Querystring();

      } else if (type === 'clearRootscope') {
        $rootScope = '';
      } else if (type === 'htmlLength') {
        // 
        $scope.funnyText = pltf.domSize('return');
        console.log($(document.body).html());
        // $scope.funnyText = '<span style="font-size: 0.3em;">' + $(document.body).html() +'</span>';
      } else {
        $scope.funnyText = 'note ready ' + Date.now();
      }
    };


    $scope.thisDomain = function () {
      //  console.log('thisDomain: ', document.URL);
      $rootScope.loginMessage = 'domain: ' + document.URL;
    };

    $scope.debugCtrl = function (state) {
      // $rootScope.debugOn = state;
      // $rootScope.debug('Debug now: ' + state);
    };

    $scope.debugLog = [{
      startItem: 'this is the start item'
  }];

    $scope.testString = function () {
      $scope.debugLog = 'string';
    };

    $scope.testObj = function () {
      $scope.debugLog = JSON.stringify([{
        item: 'this is a test item'
    }]);
    };

  });