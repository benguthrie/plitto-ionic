angular.module('userDirective', [])

/* Profile Directive / Controller */
.directive('user', function ($scope, $stateParams) {

  return {
    restrict: 'E',
    template: 'directives/user.html',
    controller: 'pctrl',
    controllerAs: 'ctrl'
  }
});