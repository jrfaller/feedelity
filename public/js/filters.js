'use strict';

/* Filters */

//var timeago = require('timeago');

angular.module('feedelity.filters', [])
  .filter('timeago', function () {
    return function (input) {
      if (input == undefined)
        return 'never'
      else
        return jQuery.timeago(input);
    };
  })
  .filter('capitalize', function () {
    return function (input) {
      if (input!=null)
        input = input.toLowerCase();
      return input.substring(0,1).toUpperCase() + input.substring(1);
    };
  })
  .filter('feedSelected', function () {
    return function (array, feed) {
      if (array == undefined) return [];
      else if (feed == undefined || feed == null) return array;
      else {
        var output = [];
        array.forEach(function(article) {
          // ._feed is an array because of Mongoose populate.
          if (article._feed[0]._id == feed._id) output.push(article); 
        });
        return output;
      }
    };
  });
