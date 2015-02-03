'use strict';
angular.module('userController', [])
  .controller('UserCtrl', function ($scope, $stateParams, dbFactory, $rootScope, pltf, localStorageService) {
    // Prepare Scope Variables
    $scope.view = 'ditto'; // Initial View

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
      'lists': [{
        loading: true
      }],
      'chat': [{
        loading: true
      }]
    };
    $scope.userInfo = {
      userId: null,
      userName: null,
      fbuid: null
    };


    if ($stateParams.view) {
      $scope.view = $stateParams.view;
    }

    // load profile data if this was direct linked to.
    if (!$scope.userInfo.userId) {
      // console.log('no userid set in profiledata. Set with one of these. ', $stateParams.userId, typeof ($stateParams.userId));

      // Get it from the url then.
      // Get a valid user id, and pull content for it.
      if (parseInt($stateParams.userId) > 0) {

        // Get user information. TODO2 
        $scope.userInfo.userId = parseInt($stateParams.userId);
        // console.log('413 ', $scope.userInfo.userId);
      }
      /* TODO2 Properly handle this error  else {
        console.log('CONTROLLER.390 NO VALID USER FROM CONTENT.', $stateParams.profile);
      }
      */

    }
    /* TODO3-3 Handle the error else 
    {
        console.log('ERROR controllers.ProfileCtrl 391 - invalid userId in the URL.');
      }
      */

    var lsTypes = ['ditto', 'shared', 'feed', 'lists', 'chat'];

    if (parseInt($rootScope.user.userId) === parseInt($scope.userInfo.userId)) {
      var lsTypes = ['feed', 'lists']; // TODO2 Put in the chat bit again. 
      $scope.view = 'feed';
      // console.log('updated scope view ? ', $scope.view);
    }

    for (var i in lsTypes) {

      if (lsTypes[i] === 'shared') {
        // Start from local storage.
        if (localStorageService.get('user' + $scope.userInfo.userId + 'shared')) {
          $scope.store.shared = localStorageService.get('user' + $scope.userInfo.userId + 'shared');
        }

        dbFactory.promiseGetSome($scope.userInfo.userId, '', 'shared').then(function (d) {
          $scope.store.shared = d;

          localStorageService.set('user' + $scope.userInfo.userId + 'shared', d);
          // console.log('update: in promise shared: ', d);
          //console.log('sun: ', $scope.userInfo.userName.length, ' dusername: ', d[0].username);

          if ($scope.userInfo.userName === null && d[0].username) {

            $scope.userInfo.userName = d[0].username;
            $scope.userInfo.fbuid = d[0].fbuid;
          }
        });


      } else if (lsTypes[i] === 'ditto') {
        // Start from local storage.
        if (localStorageService.get('user' + $scope.userInfo.userId + 'ditto')) {
          $scope.store.ditto = localStorageService.get('user' + $scope.userInfo.userId + 'ditto');
        }

        dbFactory.promiseGetSome($scope.userInfo.userId, '', 'ditto').then(function (d) {
          $scope.store.ditto = d;
          localStorageService.set('user' + $scope.userInfo.userId + 'ditto', d);
          // console.log('update: in promise  ditto: ', d);
          if ($scope.userInfo.userName === null && d[0].username) {

            $scope.userInfo.userName = d[0].username;
            $scope.userInfo.fbuid = d[0].fbuid;
          }
        });

      } else if (lsTypes[i] === 'feed') {
        if (localStorageService.get('user' + $scope.userInfo.userId + 'feed')) {
          $scope.store.feed = localStorageService.get('user' + $scope.userInfo.userId + 'feed');
        }

        dbFactory.promiseFeed('profile', $scope.userInfo.userId, '', '', '', '').then(function (d) {
          console.log('feedResponse', d.results);
          $scope.store.feed = d.results;

          if ($scope.userInfo.userName === null && d.results[0].username) {

            $scope.userInfo.userName = d.results[0].username;
            $scope.userInfo.fbuid = d.results[0].fbuid;
          }
        });


      } else if (lsTypes[i] === 'lists') {
        if (localStorageService.get('user' + $scope.userInfo.userId + 'lists')) {
          $scope.store.feedlists = localStorageService.get('user' + $scope.userInfo.userId + 'lists');
        }

        dbFactory.promiseListOfLists($scope.userInfo.userId).then(function (d) {
          $scope.store.lists = d;
          localStorageService.set('user' + $scope.userInfo.userId + 'lists', d);

          if ($scope.userInfo.userName === null && d[0].username) {

            $scope.userInfo.userName = d[0].username;
            $scope.userInfo.fbuid = d[0].fbuid;
          }
        });


      }
      /* TODO2 Handle this condition.
      else {
        console.log('TODO1 - Auto load this');
      }
      */

    }

    // Make sure that we have user information by now.
    if (!$scope.userInfo.userName) {
      // console.log('595 - No user name', $scope.userInfo.userName);
      dbFactory.userInfo($scope.userInfo.userId).then(function (d) {
        // console.log('user info: ', d);
        $scope.userInfo.fbuid = d.results.fbuid;
        $scope.userInfo.userName = d.results.userName; // Tested, and this works. 1/27/2015
      });
      /* TODO3 - Handle user name
      } else {
        console.log('597 - User name', $scope.userInfo.userName);
      }
      */


      // Put the user info in the title bar
      $scope.profileTitle = '<img src="http://graph.facebook.com/' + $scope.fbuid + '/picture" class="title-image"> ' + $scope.userName;

      $scope.showFeed = function (userId) {

        $scope.view = 'feed';
        // console.log('profile show feed: ', userId, ' oldest: ');
        // showFeed = function(theType, userFilter, listFilter, myState, oldestKey)
        // $scope.store.feed = dbFactory.showFeed('profile',userId,'','','','');

        // Then Update
        dbFactory.promiseFeed('profile', $scope.userInfo.userId, '', '', '', '').then(function (d) {
          $scope.store.feed = d;
          if ($scope.userInfo.userName === null && d[0].username) {

            $scope.userInfo.userName = d[0].username;
            $scope.userInfo.fbuid = d[0].fbuid;
          }
        });
      };

      $scope.userChat = function () {
        $scope.view = 'chat';
      };

      $scope.getSome = function (filter) {
        //  Reload only if it's the second press of the button
        if ($scope.view === filter) {
          $scope.store[filter] = [{
            'loading': true
        }];
          dbFactory.promiseGetSome($scope.userInfo.userId, '', filter).then(function (d) {
            $scope.store[filter] = d;
            // console.log('update: in promise ' + filter + ' : ', d);
            if ($scope.userInfo.userName === null && d[0].username) {

              $scope.userInfo.userName = d[0].username;
              $scope.userInfo.fbuid = d[0].fbuid;
            }
          });
        }
        $scope.view = filter;

        // console.log('profileScope view after getSome: ', $scope.view);

        // console.log('Get Some for userid: ', $scope.userInfo.userId, filter, 'end');
        // $scope.store[ filter ] = dbFactory.showFeed('profile', $scope.userId, filter , '', '', '');
        // 
        // dbGetSome = function (theScope, userfilter, listfilter, sharedFilter)
        // dbFactory.dbGetSome('$rootScope.profileData.'+filter, userId, '', filter);
      };

      $scope.showLists = function (userId) {
        // Only reload if it's already lists.
        if ($scope.view === 'lists' || $scope.store.lists[0].loading) {
          // console.log('reload lists for this user in their profile..');
          // dbFactory.getUserListOfLists(userId, '$rootScope.profileData.lists');
          $scope.store.lists = [{
            loading: true
        }];
          dbFactory.promiseListOfLists(userId).then(function (d) {
            $scope.store.lists = d;

          });

        }
        /* Default to lists if we need to. */
        $scope.view = 'lists';
      };

    }
  });