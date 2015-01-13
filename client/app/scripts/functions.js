function QueryString () {
  'use strict';
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var returnString = {};
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split('=');
    // If first entry with this name
    if (typeof returnString[pair[0]] === 'undefined') {
      returnString[pair[0]] = pair[1];
    // If second entry with this name
    } else if (typeof returnString[pair[0]] === 'string') {
      var arr = [ returnString[pair[0]], pair[1] ];
      returnString[pair[0]] = arr;
    // If third or later entry with this name
    } else {
      returnString[pair[0]].push(pair[1]);
    }
  }
  return returnString;
}
// TODO1 - Test to see of QueryString is working. 1/9/2014

function randNum( maxNum ) {
  'use strict';
  return Math.floor((Math.random() * maxNum) + 1 );
}

function navigationBar () {
  'use strict';
  return '<ion-nav-bar class="bar-stable">' +
    '<ion-nav-back-button></ion-nav-back-button>' +
    '<ion-nav-buttons side="primary">' +
      '<button menu-toggle="left" class="button button-icon ion-navicon"></button>' +
    '</ion-nav-buttons>' +
    '<ion-nav-buttons side="secondary">' +
    '<button class="button button-icon ionicons ion-plus-circled" ng-click=" navFunc(\'addlist\');"></button>' +
      '<button class="button button-icon ion-chatbox" ng-click="navFunc(\'chat\');">' +
        '<span class="innerNo" ng-bind="$root.stats.alertCount"></style></button>' +
      // ' <button class="button button-icon iconDice" ng-click="navFunc(\'home\'); getSome();"></button> ' +
      '<button class="button button-icon ion-ios7-checkmark-outline" ng-click="navFunc(\'home\'); getSome();"></button>' +
      '<button class="button button-icon ion-search" ng-click="navFunc(\'search\');"></button>' +
    '</ion-nav-buttons>' +
 '</ion-nav-bar>';
}
