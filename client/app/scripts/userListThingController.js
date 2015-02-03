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
        $scope.$on('$destroy', function () {
          // This will clear this recordset, but not the others. TODO1 = Do that!
          $scope.userData = [];
        });

        /* Ditto */
        $scope.ditto = function (mykey, uid, lid, tid, itemKey, $event) {

          var arrPair = new Array();

          var i, j, k;
          // If the list matches, and the thing matches, then update the ditto info.

          // Traverse this user's lists to find the existing item.
          for (var i in $scope.userData.lists) {
            if (lid === $scope.userData.lists[i].lid) {
              for (j in $scope.userData.lists[i].items) {
                //console.log('check 426: ',$scope.userData.lists[i].items[j].tid, tid);
                if ($scope.userData.lists[i].items[j].tid === tid) {
                  $scope.userData.lists[i].items[j].mykey = 0; // TODO - This could be causing a bug.
                  if (mykey) {
                    $scope.userData.lists[i].items[j].friendsWith = '?';
                  }
                  /* Log the position in the array that will be used to update */
                  arrPair.push(new Array(i, j));
                }
              }
            }
          }

          // Convert this to a scope return. dbFactory.dbDitto( scopeName, mykey, uid, lid, tid, itemKey, $event);
          var dbResponse = [];

          /* The elements are [0] - mykey / null , [1]:[friendsWith] / undefined - [2]['ditto'/'remove'] */
          dbFactory.promiseDitto(mykey, uid, lid, tid, itemKey, $event).then(function (d) {

            for (k in arrPair) {
              if (parseInt(d[0])) {
                // Update my key with my new one.
                $scope.userData.lists[arrPair[k][0]].items[arrPair[k][1]].mykey = String(d[0]);
              } else {
                // Set my key to null, because I don't have it any more.
                $scope.userData.lists[arrPair[k][0]].items[arrPair[k][1]].mykey = null;
              }

              if (parseInt(d[1])) {
                $scope.userData.lists[arrPair[k][0]].items[arrPair[k][1]].friendsWith = '+' + d[1];
              } else {
                $scope.userData.lists[arrPair[k][0]].items[arrPair[k][1]].friendsWith = '';
              }
            }
          });
        };

        /* User */
        $scope.showUser = function (userId, userName, dataScope, fbuid) {
          if (parseInt(userId) !== 0) {
            $state.go('app.user', {
              userId: userId,
              userName: userName
            });
            // dbFactory.showUser(userId,userName, dataScope, fbuid);
            $scope.userData = [];
          }
        };

        /* List */
        $scope.showList = function (listId, listName, userFilter, focusTarget) {
          // TODO - Fix this. dbFactory.showAList(listId, listName, userFilter, focusTarget);
          $state.go('app.list', {
            listId: listId,
            listName: listName
          });
          $scope.userData = [];
        };

        /* Thing */
        $scope.showThing = function (thingId, thingName, userFilter) {

          $state.go('app.thing', {
            thingId: thingId,
            thingName: thingName
          });
          $scope.userData = [];

          // dbFactory.showThing(thingId, thingName, userFilter);
        };

        /* Let's Chat
        letsChat(userData.uid, list.lid, item.tid, item.ik, $event, $index); " 
        TODO2 - Remove $index and $event.
        */
        $scope.letsChat = function (uid, lid, tid, itemKey, $event, $index) {
          //console.log('letsChat app.js directive', uid, lid, tid, itemKey, $event, $index);
          // Find the item in this list.
          var i = 0,
            j = 0,
            abort = false;
          loop1:
            for (i in $scope.userData.lists) {
              if (lid === $scope.userData.lists[i].lid) {
                var j = 0;
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
          });
        };

        $scope.makeItemComment = function (newComment, uid, lid, tid, itemKey, $index) {
          //console.log('makeItemComment', newComment, uid, lid, tid, itemKey, $index);
          // Find the user, then the list, then use the index.

          // Get the user ID number.
          var upos = null;
          var lpos = null;
          var tpos = null;


          // Find the item in this list.
          var i = 0,
            j = 0;
          loop1:
            for (i in $scope.userData.lists) {
              if (lid === $scope.userData.lists[i].lid) {
                var j = 0;
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
          var listTids = new Array();

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
          $scope.userData.lists[finalJ].showMore = 0;

          // User Id, List Id, filter: 'all' future: ditto, shared, tids, limit 
          dbFactory.getMore($scope.userData.uid, lid, 'all', listTids, 10).then(function (d) {
            // We only need the user's items. It will be just one user, and just this list, which we know where it is thanks to the i variable above. 

            if (!d.results.length) {
              // We ran out of more items!
              $scope.showMore = false;
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