'use strict';

// Declare app level module which depends on filters, and services
angular.module('feedelity', ['feedelity.filters', 'feedelity.services', 'feedelity.directives', 'ngRoute', 'ngSanitize']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.
      when('/articles', {templateUrl: 'partial/articles', controller: ArticlesCtrl}).
      when('/articles/:typeid', {templateUrl: 'partial/articles', controller: ArticlesCtrl}).
      when('/feeds', {templateUrl: 'partial/feeds', controller: FeedsCtrl}).
      otherwise({redirectTo: '/articles'});
    $locationProvider.html5Mode(true).hashPrefix('!');
  }]);