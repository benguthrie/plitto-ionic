angular.module('thingController', [])

.controller('ThingCtrl',
  function ($scope, dbFactory, $stateParams, localStorageService, pltf, $rootScope) {

    $scope.thing = {
      name: 'Loading',
      id: $stateParams.thingId,
      data: [{
        loading: true
      }]
    };

    if (localStorageService.get('thing' + $stateParams.thingId)) {
      // console.log('local storage. Found thing by id/');
      $scope.thing.data = localStorageService.get('thing' + $scope.thing.id);
    } else {
      // console.log('no thing in local storage: ', $stateParams.thingId);
    }

    // console.log('thingid: ', $scope.thing.id );
    /* Load thing information from the Api 1/23/2015 */
    dbFactory.promiseThing($scope.thing.id, '').then(function (d) {
      $scope.thing.data = d;
      if (d.length) {
        $scope.thing.name = d[0].lists[0].items[0].thingname;
      }
      localStorageService.set('thing' + $stateParams.thingId, d);

    });

    // Update the thing info from the api
    console.log('TODO1 - Load this from the API, automatically? .');

    // Control for thing goes here.
    // console.log('controllers.js.thingCtrl use scope, rootscope, dbFactory', $scope);

  }
);