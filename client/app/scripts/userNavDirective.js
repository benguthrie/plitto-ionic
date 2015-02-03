angular.module('userNavDirective', [])
  .directive('userNav', function ($rootScope, dbFactory, $state, pltf) {
    return {
      restrict: 'E',
      // // templateUrl: 'directives/userNav.html', // Not rendering.
      template: '<ion-nav-bar class="bar-stable plittoBar">' +
        '<ion-nav-back-button></ion-nav-back-button>' +
        '<ion-nav-buttons side="left">' +

        '<button menu-toggle="left" class="button button-icon icon ion-navicon"></button>' +
        '</ion-nav-buttons>' +
        '<ion-nav-buttons side="secondary" class="navSecond">' +
        '{{domLengthNum}}' +
        '<a ng-click="domLength();" class="button button-icon ionicons ion-help-buoy"></a> ' +
        '<a href="#/app/addlist" class="button button-icon ionicons ion-plus-circled"></a> ' +
        '<a href="#/app/home" class="button button-icon ion-ios7-checkmark-outline"></a> ' +
        '<a href="#/app/search" class="button button-icon ion-search"></a> ' +
        '</button>' +
        '</ion-nav-buttons>' +
        '</ion-nav-bar>',
      controller: function ($scope) {
          $scope.domLengthNum = 0;
          $scope.domLength = function () {
            $scope.domLengthNum = $(document.body).html().length;
          }
        }
        // scope: {}
        /*
        , controller: function ($scope, dbFactory, $state, pltf) {
          /
          };}
          */

    };
  });