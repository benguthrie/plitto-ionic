'use strict';
angular.module('chatDirective', []).directive('chat',
  function () {
    return {
      restrict: 'E',
      templateUrl: 'directives/chat.html',

      scope: {
        notificationsData: '=notificationsData'
      },
      controller: function ($scope, dbFactory, $state) {
        // Debug
        $scope.changeFilter = function (filterNew) {
          //console.log('TEST', filterNew);
          $scope.filterChat = filterNew;
        };

        // $scope.filterChatOptions = [ { filter: "them", selected: true }, { filter: "us", selected: false }, { filter: "me", selected: false } ];
        $scope.filterChatOptions = [{
          show: 'Them',
          value: 'them'
        }, {
          show: 'Us',
          value: 'us'
        }, {
          show: 'Me',
          value: 'me'
        }];
        $scope.filterChat = $scope.filterChatOptions[0];
      }
    };
  }
);