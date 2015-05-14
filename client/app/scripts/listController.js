'use strict';
angular.module('listController', [])
  .controller('ListCtrl', function ($scope, $stateParams, $rootScope, dbFactory, localStorageService, pltf) {


    $scope.view = 'ditto';
    $scope.store = {
      'ditto': [{
        loading: true
      }],
      'shared': [{
        loading: true
      }],
      'feed': [{
        loading: true
      }],
      'mine': [{
        loading: true
      }],
      'strangers': [{
        loading: true
      }]
    };

    $scope.listInfo = {
      listId: $stateParams.listId,
      listName: null
    };

    /* Clear any previously entered text in the 'add to list' section */
    $scope.newItem = {
      theValue: null
    };


    // Populate the list on load.
    var listViews = new Array('ditto', 'shared', 'feed', 'mine', 'strangers');

    // TODO2 - userIdFilter is ignored. It should allow for a specific user to be viewed. 
    var userIdFilter = 0; // TODO2 - Allow this to be set.
    var sharedFilter = 0; // TODO2 - Allow this to be set.
    var oldestKey = 0; // TODO2 - Allow this to be set.

    /* Load all the list view types */
    var i = 0;
    for (i in listViews) {
      /*
      if (!$scope.store[listViews[i]].length) {
        $scope.store[listViews[i]][0] = {
          loading: true
        };
      }
      */

      /* Apply local storage if it's present */
      if (localStorageService.get('listId' + $stateParams.listId + listViews[i])) {
        $scope.store[listViews[i]] = localStorageService.get('listId' + $stateParams.listId + listViews[i]);
      }

      /* Load each of the views from the API */
      dbFactory.promiseList($scope.listInfo.listId, userIdFilter, listViews[i], sharedFilter, oldestKey).
      then(function (d) {

        /*  
          Only apply valid responses to the scope. Types could be null. 
           use d.type because of async responses require the data to define itself. 
        */
        if (typeof (d.type) !== 'undefined') {
          $scope.store[d.type] = d.results[d.type];
        } else {
          /* if no response, clear the results */
          //         $scope.store[d.type] = [];
          pltf.log('controllers1013 - This condition could be required for error handling.');
        }

        /* If there are results, and we need a list name, then apply the list name from the data */

        if ($scope.listInfo.listName === null && typeof (d.results) !== 'undefined' && typeof (d.results[d.type]) !== 'undefined' && typeof (d.results[d.type].lists) !== 'undefined' && typeof (d.results[d.type].lists[0].listname) !== 'undefined') {
          $scope.listInfo.listName = d.results[d.type].lists[0].listname;
        }
      });
    }

    /* If we don't have a list name at this point, it must be a new list. Force Load it. */
    if ($scope.listInfo.listName === null || $scope.listInfo.listName.length === 0) {
      console.log('force load the list info, and assume this user created the list');
      dbFactory.promiseThingName($scope.listInfo.listId).then(function (d) {
        console.log('d.results: ' + d.results + ' length: ' + d.results.length);
        if (d.results) {
          // console.log('valid results from d.results' + d.results[0].thingName);
          $scope.listInfo.listName = d.results[0].thingName;
          // Set the view to theirs, so they can add an item.
          $scope.view = 'mine';

        }

      });
    }

    /* End the scope loading. */

    // TODO3 - Link directly to parts of this view. i.e. lists/400/view/shared

    /* This is the function used when changing views */
    $scope.setView = function (theView) {

      /* If it is already this view, or loading, then reload this content. */
      if (theView === $scope.view || $scope.store[theView].length === 0 || $scope.store[theView][0].loading === true) {

        /* Create the loading Indicator */
        $scope.store[theView] = [{
          loading: true
        }];

        /* The the view is passed as part of the database call */
        dbFactory.promiseList($scope.listInfo.listId, userIdFilter, theView, sharedFilter, oldestKey).then(function (d) {

          // only add it to the scope if it's a valid response.
          if (typeof (d.type) !== 'undefined') {
            $scope.store[d.type] = d.results[d.type];
          } else {
            /* set to no records if we got it. A message keys off of 0 records */
            $scope.store[theView] = [];
          }
        });
      }
      /* Update the view after the check. This means that data isn't reloaded unless it's the same view */
      $scope.view = theView;

    };

    $scope.addToList = function (newItemName) {
      //Step - Focus the view on your list.
      $scope.view = 'mine';
      console.log('FELIX   FELIX   FELIX   controllers.listCtrl.addToList(newItem)' + newItemName);
      // Step: Make sure that there is something.
      if (!newItemName.length) {
        console.log('no length for the new item. 1054');
        return;
      }

      // Step: Clear the new item model.
      $scope.newItem.theValue = null;

      /* Create a placeholder for while the API responds */
      var tempNum = pltf.randNum(10000);
      console.log('tempNum: ' + tempNum);
      var tempItem = {
        added: Date.now(),
        commentActive: null,
        commentRead: null,
        commentText: null,
        dittofbuid: null,
        dittokey: null,
        dittouser: null,
        dittousername: null,
        friendsWith: '',
        id: tempNum,
        ik: null,
        mykey: 1,
        thingname: '... ' + newItemName,
        tid: null
      };

      /* Create My List if this is the first item in my list */
      if ($scope.store.mine.length === 0) {
        // console.log('create my list because my list has no length' + $scope.store.mine.length);
        var myList = {
          fbuid: $rootScope.user.fbuid,
          uid: $rootScope.user.userId,
          username: $rootScope.user.userName,
          lists: [
            {
              lid: $scope.listInfo.lid,
              listname: $scope.listInfo.listName,
              items: []
            }
          ]
        };
        // Add my new list to the store 
        $scope.store.mine.unshift(myList);

      } // TODO2 Handle the error condition 
      else {
        console.log('my existing list has a length of : ' + $scope.store.mine.length);
      }

      /* remove the existing item from my list visibly. */
      // But only if I have existing items. 
      if (!$scope.store.mine[0].lists[0].items.length) {
        // console.log('crisis averted. items: ', $scope.store.mine[0].lists[0].items.length);
        // NOTE - This is how I remove my out of date items. 
      } else {
        var j = $scope.store.mine[0].lists[0].items.length;
        var i = 0;
        while (i < j) {

          // Step - It matched. Note it.
          if ($scope.store.mine[0].lists[0].items[i].thingname.toUpperCase() === newItemName.toUpperCase()) {
            $scope.store.mine[0].lists[0].items.splice(i, 1);
            break;
          }
          i++;
        }

      }

      /* Step - Add this item as the first item in my list */
      $scope.store.mine[0].lists[0].items.unshift(tempItem);

      /* Step Prepare to submit to the dbFactory */
      var itemObj = {
        lid: $scope.listInfo.listId,
        thingName: newItemName
      };


      /* Step - Submit to the database */
      dbFactory.promiseAddToList(itemObj).then(function (d) {
        // console.log('new item (response): ', newItemName, d);
        /* Check to see if the item has a valid key */
        var i = 0;
        // there was a var j, but it wasn't used.
        if (typeof (d.mykey) !== 'undefined') {

          /* Valid results from the API. Begin processing adding this item */
          /* Overwrite the temp value. We know that it will only have one entry. */
          var newItemPos = null;

          for (i in $scope.store.mine[0].lists[0].items) {
            if ($scope.store.mine[0].lists[0].items[i].id === tempNum) {
              newItemPos = i;
              break;
            }
          }

        }
        /* TODO2 - Handle this error condition. else {
                  console.log('error. TODO2 - Handle this? ');
                }
                */

        /* Overwrite the temp item with the new item. I will be in the right spot. */
        $scope.store.mine[0].lists[0].items[i] = d;

        // console.log('updatedItem: ', $scope.store.mine[0].lists[0].items[i]);

      });


    };
    /* End List Control */
  });
