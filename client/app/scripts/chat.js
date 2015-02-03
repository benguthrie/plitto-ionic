angular.module('chatDirective',[]).directive('chat',
  function ($rootScope, dbFactory, $state) { 
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

        // TODO2 - This should be a global.
        // This is for the logged in user
        $scope.showUser = function (userId, userName, dataScope, fbuid) {
          //console.log('controllers.js - showUser 87');
          // dbFactory.showUser(userId,userName, dataScope, fbuid);
          $state.go('app.user', {
            userId: userId
          });
        };

        /* Link to List */
        $scope.showList = function (listId, listName, userFilter, focusTarget) {
          //console.log('showList app.js 493');
          dbFactory.showAList(listId, listName, userFilter, focusTarget);
        };


        /* Thing */
        $scope.showThing = function (thingId, thingName, userFilter) {
          //console.log('showThing');
          // dbFactory.showThing(thingId, thingName, userFilter);
          $state.go('app.thing', {
            thingId: thingId
          });
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