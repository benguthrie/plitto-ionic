'use strict';
angular.module('pConstant', [])
  /* Config Defaults */
  .constant('pltf', {
    'domSize': function (output) {
      if (output === 'console') {
        //console.log('HTMLString', $(document.body).html().length);
      } else if (output === 'return') {
        return $(document.body).html().length;
      }

    },
    'log': function (toLog) {

      // turned debug off. 
      // 

      //console.log(toLog);
    },
    'QueryString': function () {
      'use strict';
      //console.log('70 NO NEED FOR THIS QUERYSTRING FUNCTION???');

      // This function is anonymous, is executed immediately and 
      // the return value is assigned to QueryString!
      var returnString = {};
      var query = window.location.search.substring(1);
      var vars = query.split('&');
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        // If first entry with this name
        if (typeof returnString[pair[0]] === 'undefined') {
          returnString[pair[0]] = pair[1];
          // If second entry with this name
        } else if (typeof returnString[pair[0]] === 'string') {
          var arr = [returnString[pair[0]], pair[1]];
          returnString[pair[0]] = arr;
          // If third or later entry with this name
        } else {
          returnString[pair[0]].push(pair[1]);
        }
      }
      return returnString;
    },
    'plainJsRedirect': function (url) {
      'use strict';
      //console.log('plainJsRedirect: ', url);
      // window.location.href = url;
      // window.location.assign(url);
      setTimeout(function () {
        location.href = url;
      }, 5000);

    },
    'randNum': function (maxNum) {
      'use strict';
      return Math.floor((Math.random() * maxNum) + 1);
    }
  });