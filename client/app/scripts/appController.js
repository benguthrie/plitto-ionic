angular.module('appController', [])
  // REMOVED Facebook from the injectors // 13 - ionicNavBarDelegate - 14 - $ionicHistory
  .controller(
    'AppCtrl',
    function ($scope, $state, dbFactory, $rootScope, localStorageService, pltf) {

      // On load, load the correct interface, based on the token.

      // console.log('AppCtrl.load: Token: ' + $rootScope.token);
      // Execute the check for the token in the RootScope on load.

      if (typeof ($rootScope.token) === 'string' && $rootScope.token === 'loading') {
        // console.log('initial: loading');

        $state.go('loading');
      } else if (typeof ($rootScope.token) === 'string' && $rootScope.token.length > 0) {
        // We will assume that the token is valid TODO1 - Test it.
        // $rootScope.debug('Appctrl - 183 Loading because the token looks good.');
        // $state.go('app.home'); // TODO1 - Diego - Should this be moved? - Not working!

        if (typeof $rootScope.token === 'string' && $rootScope.token !== 'loading') {
          // Only when it's loading or home.
          if ($state.current.name === 'login' || $state.current.name === 'loading') {
            $state.go('app.home');

          }
          // TODO2 -  Test this. 
        }
        // TODO2 - Update someday? dbFactory.updateCounts();

        // TODO1 - Check this, or will that happen when requesting the first call?
        //     $ionicHistory.clearHistory();
        // $location.path('/login');
      } else {
        console.log('initial: null?');
        $rootScope.loginMessage = 'Checking for null token.';
        // TODO1 When would this be done? $state.go("login");
      }

      $scope.deleteFBaccess = function () {
        // console.log('deleteFBaccess in loginctrl TODO1 ');
        $rootScope.$broadcast('broadcast', {
          command: 'deleteFBaccess',
          debug: 'Delete from FB'
        });
        // TODO1 Restore this: Facebook.unsubscribe();
      };

      // This is for the logged in user
      $scope.showUser = function (userId, userName, dataScope, fbuid) {

        // console.log('controllers.js - showUser 87');
        /// dbFactory.showUser(userId,userName, dataScope, fbuid);'
        $state.go('app.user', {
          userId: userId
        });

      };

      // Grab the user info here as soon as they login.

      $scope.login = function () {
        $rootScope.$broadcast('broadcast', {
          command: 'login',
          platform: 'facebook',
          debug: 'Controllers.js 210. OAuth.login'
        });
      };

      // Global Logout Handler - TODO2 - This was added to functions.js and should be removed from here.
      $scope.logout = function () {
        // TODO: Make database service call.
        // console.log('logout');

        // $state.go('app.login',{listId: newListId});
        // TODO1 - Restore this. Facebook.logout();

        // Clear all the stores.
        dbFactory.dbInit();
        localStorageService.clearAll();
        // $rootScope.debug('clear rootScope. Rootscope: ' + JSON.stringify($rootScope));

        // Clear local storage

        // TODO1 - Restore this, most likely. $state.go("login");
        /*
    
      .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      })
      */
      };

      /* 1/23/2015
      $scope.loadLists = function(){
        $rootScope.debug('AppCtrl You want to load lists into your profile.');
        // dbFactory.getUserListOfLists($rootScope.vars.user.userId);
        dbFactory.getUserListOfLists($rootScope.user.userId , '$rootScope.lists');
      };
       */


    })

;