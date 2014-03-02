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
    });
