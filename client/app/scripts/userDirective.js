'use strict';
/* Profile Directive / Controller */
angular.module('userDirective', []).directive('user', function () {

  return {
    restrict: 'E',
    template: 'directives/user.html',
    controller: 'UserCtrl',
    controllerAs: 'ctrl'
  };
});