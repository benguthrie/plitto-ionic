var QueryString = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    	// If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = pair[1];
    	// If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]], pair[1] ];
      query_string[pair[0]] = arr;
    	// If third or later entry with this name
    } else {
      query_string[pair[0]].push(pair[1]);
    }
  } 
    return query_string;
} ( );

var randNum = function( maxNum ) {
  return Math.floor((Math.random() * maxNum) + 1 );
};

var navigationBar = function(){
  return '<ion-nav-bar class="bar-stable">  ' + 
    '<ion-nav-back-button></ion-nav-back-button>' +
    '<ion-nav-buttons side="primary"> ' + 
      '<button menu-toggle="left" class="button button-icon ion-navicon"></button> ' + 
    '</ion-nav-buttons> ' + 
    '<ion-nav-buttons side="secondary"> ' + 
    ' <button class="button button-icon  ionicons ion-plus-circled" ng-click=" navFunc(\'addlist\'); "></button> ' + 
    
      ' <button class="button button-icon ion-chatbox" ng-click="navFunc(\'chat\');"> ' + 
        ' <span class="innerNo" ng-bind="$root.stats.alertCount"></style></button>  ' + 
      // ' <button class="button button-icon iconDice" ng-click="navFunc(\'home\'); getSome();"></button> ' +
      ' <button class="button button-icon ion-refresh" ng-click="navFunc(\'home\'); getSome();"></button> ' +
      ' <button class="button button-icon ion-search" ng-click="navFunc(\'search\');" > </button> '+
    '</ion-nav-buttons>' +
 '</ion-nav-bar>';
  
};