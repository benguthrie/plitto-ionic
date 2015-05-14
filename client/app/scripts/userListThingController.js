'use strict';
angular.module('userListThingController', [])
  .directive('userListThing', function (dbFactory, $state) {

    return {
      restrict: 'E',
      templateUrl: 'directives/userListThing.html',
      scope: {
        store: '@store',
        source: '@source',
        userData: '=userData'
      },
      controller: function ($scope, dbFactory) {

        /* Ditto */
        $scope.ditto = function (mykey, uid, lid, tid, itemKey) {

          var arrPair = [];

          // Traverse this user's lists to find the existing item.
          for (var i = 0; i < $scope.userData.lists.length; i++) {
            // console.log('e33', $scope.userData.lists[i], parseInt(lid), parseInt($scope.userData.lists[i].lid));
            if (parseInt(lid) === parseInt($scope.userData.lists[i].lid)) {
              //console.log('list matches. g35');
              for (var j = 0; j < $scope.userData.lists[i].items.length; j++) {
                //console.log('check 426: ',$scope.userData.lists[i].items[j].tid, tid);
                if (parseInt($scope.userData.lists[i].items[j].tid) === parseInt(tid)) {

                  $scope.userData.lists[i].items[j].mykey = 0;
                  $scope.userData.lists[i].items[j].friendsWith = '?'; // This makes it go to a question mark.

                  /* Log the position in the array that will be used to update */
                  arrPair.push(new Array(i, j));
                }
              }
            }
          }
          /* else { 
console.log(' list no match: ', parseInt(lid), parseInt($scope.userData.lists[i].lid));
} * /
          };

          /* The elements are [0] - mykey / null , [1]:[friendsWith] / undefined - [2]['ditto'/'remove'] */
          dbFactory.promiseDitto(mykey, uid, lid, tid, itemKey).then(
            function (d) {
              for (var k = 0; k < arrPair.length; k++) {
                // console.log('d', d[0], d[1]);
                // console.log('c', k, d, String(d[0]));
                // console.log('B ', $scope.userData.lists[arrPair[k][0]]);
                // console.log('A ', $scope.userData.lists[arrPair[k][0]].items[arrPair[k][1]]);
                if (parseInt(d[0])) {
                  // Apply my item's key
                  $scope.userData.lists[arrPair[k][0]].items[arrPair[k][1]].mykey = String(d[0]);
                } else {
                  // Set my key to null, because I don't have it any more.
                  $scope.userData.lists[arrPair[k][0]].items[arrPair[k][1]].mykey = null;
                }

                // Apply the count of my friends with this item.
                if (parseInt(d[1])) {
                  $scope.userData.lists[arrPair[k][0]].items[arrPair[k][1]].friendsWith = '+' + d[1];
                } else {
                  $scope.userData.lists[arrPair[k][0]].items[arrPair[k][1]].friendsWith = '';
                }
              }
            }
          );
        };

        /* User */
        $scope.showUser = function (userId, userName, fbuid) {
          if (parseInt(userId) !== 0) {
            $state.go('app.user', {
              userId: userId,
              userName: userName,
              fbuid: fbuid
            });

            $scope.userData = [];
          }
        };

        /* List */
        $scope.showList = function (listId, listName, userFilter) {
          // TODO - Fix this. dbFactory.showAList(listId, listName, userFilter, focusTarget);
          $state.go('app.list', {
            listId: listId,
            listName: listName,
            userFilter: userFilter
          });
          $scope.userData = [];
        };

        /* Thing */
        $scope.showThing = function (thingId, thingName, userFilter) {
          console.log('Use userFilter later ' + userFilter);
          $state.go('app.thing', {
            thingId: thingId,
            thingName: thingName
          });
          $scope.userData = [];

          // dbFactory.showThing(thingId, thingName, userFilter);
        };

        /* Let's Chat
        letsChat(userData.uid, list.lid, item.tid, item.ik, $event); " 
        TODO2 - Remove $index and $event.
        */
        $scope.letsChat = function (uid, lid, tid, itemKey, $event) {
          //console.log('letsChat app.js directive', uid, lid, tid, itemKey, $event );
          // Find the item in this list.
          var i = 0,
            j = 0;

          loop1:
            for (i in $scope.userData.lists) {
              if (lid === $scope.userData.lists[i].lid) {
                j = 0;
                loop2:
                  for (j in $scope.userData.lists[i].items) {
                    if ($scope.userData.lists[i].items[j].ik === itemKey) {
                      break loop1;
                    }
                  }
              }
            }

          //console.log('vars: i,j',i,j);

          var isActive = 1;
          if ($($event.target).hasClass('active')) {
            // User is removing this from their chat queue.
            isActive = 0;
            $($event.target).removeClass('active');
            $('div#comments' + uid + lid + tid).hide();
            $scope.userData.lists[i].items[j].commentActive = null;
          } else {

            $($event.target).addClass('active');
            $('div#comments' + uid + lid + tid).show();
            $scope.userData.lists[i].items[j].commentActive = '1';

          }
          // Call the addComment bit to activate or deactivate the queue item
          dbFactory.promiseAddComment(uid, lid, tid, itemKey, '0', isActive).then(function (d) {
            // NO FEEDBACK ON ADD COMMENT? 
            console.log('Do something with d ' + d);
          });
        };

        $scope.makeItemComment = function (newComment, uid, lid, tid, itemKey) {
          //console.log('makeItemComment', newComment, uid, lid, tid, itemKey);
          // Find the user, then the list, then use the index.


          // Find the item in this list.
          var i = 0,
            j = 0;
          loop1:
            for (i in $scope.userData.lists) {
              if (lid === $scope.userData.lists[i].lid) {
                j = 0;
                loop2:
                  for (j in $scope.userData.lists[i].items) {
                    if ($scope.userData.lists[i].items[j].ik === itemKey) {
                      break loop1;
                    }
                  }
              }
            }

          //console.log('vars: i,j', i, j);
          $scope.userData.lists[i].items[j].commentText = newComment;

          // submit it to the database
          // 
          dbFactory.promiseAddComment(uid, lid, tid, itemKey, newComment, '1').then(function (d) {
            //console.log('ult521 add comment');
            console.log('Do something with d ' + d);
          });

          // TODO1 Clear the comment field

        };

        // moreOfThis( list.lid );
        $scope.moreOfThis = function (lid) {
          //console.log('app.ult.moreOfThis: ,  lid: ', lid, ' userData: ', $scope.userData, $scope.userData.lists.length);
          // Note: A null userId is required to get content from a user and their contacts. A 0 will return strangers.

          // Track the final list position in userData. 
          var finalJ = null;
          //console.log('ud lengthL '+ $scope.userData.length);
          // Create something to hold items.
          var listTids = [];

          // Find this list position.
          for (var j = 0; j < $scope.userData.lists.length; j++) {
            //  //console.log('app.ult.moreofthis lidTEST', $scope.userData.lists[j].lid, lid);
            if ($scope.userData.lists[j].lid === lid) {
              finalJ = j;
              //console.log('j, finalj', j, finalJ);

              for (var i = 0; i < $scope.userData.lists[j].items.length; i++) {
                // itemIds.push = $scope.userData.lists[j].items[i].ik;\
                listTids.push($scope.userData.lists[j].items[i].tid);
                ////console.log('app.ult.moreofthis $scope.userData.lists[j].items[i]' , $scope.userData.lists[j].items[i].ik );
              }
              // Set i, j to 1000 to end the loop. 
              finalJ = j;
              i = 1000;
              j = 1000;
              //console.log("END THE LOOP!");
            }
          }
          // Ask for 10 more items, for now by setting this button's value to 'loading'
          // console.log('Scope.userdata.',$scope.userData.lists[0],'final j: ',finalJ);
          $scope.userData.lists[finalJ].showMore = '0';

          // User Id, List Id, filter: 'all' future: ditto, shared, tids, limit 
          dbFactory.getMore($scope.userData.uid, lid, 'all', listTids, 10).then(function (d) {
            // We only need the user's items. It will be just one user, and just this list, which we know where it is thanks to the i variable above. 

            if (!d.results.length) {
              // We ran out of more items!
              $scope.userData.lists[finalJ].showMore = false;
            } else {
              // We have results. Merge them.

              $scope.userData.lists[finalJ].items = $scope.userData.lists[finalJ].items.concat(d.results[0].lists[0].items);

              /*
              for(var i = 0; i < d.results[0].lists[0].items.length; i++){
                //console.log('d.results[0].lists[0].items[i]', d.results[0].lists[0].items[i]);
                // $scope.userData.lists[finalJ].items.splice(0, 0, d.results[0].lists[0].items[i]);
                $scope.userData.lists[finalJ].items.push(d.results[0].lists[0].items[i]);
              } */

              //console.log('new userdata', $scope.userData);


              $scope.userData.lists[finalJ].showMore = d.isMore;
              //
              // console.log('showMore: ', d.isMore);
            }

          });
        };

      }
    };

  });
