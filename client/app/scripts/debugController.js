'use strict';
angular.module('debugController', [])
  .controller('DebugCtrl', function ($scope, dbFactory, localStorageService, $state, pltf) {

    $scope.localStorage = function (type) {
      if (type === 'get') {
        localStorageService.get('debugNote');
      } else if (type === 'set') {
        localStorageService.set('debugNote', 'The Current Unix Time is: ' + Date.now());
      }
      // console.log('test debug local Storage');
    };

    $scope.funny = function (type) {
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

      } else if (type === 'htmlLength') {
        // 
        $scope.funnyText = pltf.domSize('return');
        // console.log($(document.body).html());

      } else if (type === 'currentTime') {
        var d = new Date();
        var n = d.getTimezoneOffset();
        console.log('n just to use it ' + n);
        $scope.funnyText = 'The Time Is: ' + d + ' and timezone offset: ' + d.getTimezoneOffset();

        // $scope.funnyTime = moment().format();

      } else {
        // $scope.funnyText = 'note ready ' + Date();
        console.log('note ready');
      }
    };


    $scope.thisDomain = function () {
      //  console.log('thisDomain: ', document.URL);
      $scope.funnyText = 'domain: ' + document.URL;
    };

    $scope.debugCtrl = function () {
      // Maybe there will be a global debug command? 
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
