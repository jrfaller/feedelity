'use strict';

/* Controllers */

function AppCtrl($scope, $http) {
  $http({method: 'GET', url: '/api/feeds'}).
  success(function(data, status, headers, config) {
    $scope.feeds = data;
  }).
  error(function(data, status, headers, config) {
    $scope.feeds = []
  });
}

function ArticlesCtrl($scope, $http, $routeParams) {
  var type = $routeParams.typeid;
  if (!( type == 'unread' || type == 'read' || type == 'starred' )) type = 'unread';
  var articlesUrl = '/api/articles/' + type;
  
  
  $http({method: 'GET', url: articlesUrl}).
  success(function(data, status, headers, config) {
    $scope.articles = data;
  }).
  error(function(data, status, headers, config) {
    $scope.articles = []
  });
  
  $http({method: 'GET', url: '/api/feeds'}).
  success(function(data, status, headers, config) {
    $scope.feeds = data;
  }).
  error(function(data, status, headers, config) {
    $scope.feeds = []
  });
  
  $http({method: 'GET', url: '/api/feeds'}).
  success(function(data, status, headers, config) {
    $scope.feeds = data;
  }).
  error(function(data, status, headers, config) {
    $scope.feeds = []
  });
  
  $scope.read = function(id) {
    $scope.articles[id].read = !$scope.articles[id].read; 
    $scope.update(id);
  }
  
  $scope.ensureRead = function(id) {
    if ($scope.articles[id].read == false)
      $scope.read(id);
  }
  
  $scope.star = function(id) {
    $scope.articles[id].starred = !$scope.articles[id].starred;
    $scope.update(id);
  }
  
  $scope.update = function(id) {
    $http({method: 'POST', data: $scope.articles[id], url: '/api/articles/' + $scope.articles[id]._id});
  }
  
  $scope.refresh = function() {
    $http({method: 'GET', url: '/api/articles/refresh'}).
    success(function(data, status, headers, config) {
      $http({method: 'GET', url: '/api/articles/unread'}).
      success(function(data, status, headers, config) {
        $scope.articles = data;
      }).
      error(function(data, status, headers, config) {
        $scope.articles = []
      });
    });
  }
}

function FeedsCtrl($scope, $http) {
  $http({method: 'GET', url: '/api/feeds'}).
  success(function(data, status, headers, config) {
    $scope.feeds = data;
  }).
  error(function(data, status, headers, config) {
    $scope.feeds = []
  });
  
  $scope.delete = function(id) {
    var delFeed = $scope.feeds[id];
    $http({method: 'DELETE', url: '/api/feeds/' + delFeed._id}).
    success(function(data, status, headers, config) { $scope.feeds.splice(id, 1); });    
  }
  
  $scope.add = function() {
    $http({method: 'POST', data: $scope.addFeed, url: '/api/feeds'}).
    success(function(data, status, headers, config) {
      $scope.feeds.push(data); 
      $scope.addFeed = {}; 
    });
  }
  
  $scope.dispUpdate = function(id) {
    var editFeed = $scope.feeds[id];
    $scope.editFeedId = id;
    $http({method: 'GET', url: '/api/feeds/' + editFeed._id}).
    success(function(data, status, headers, config) { $scope.editFeed = data;}).
    error(function(data, status, headers, config) { $scope.editFeed = {} });
  }
  
  $scope.update = function() {
    $http({method: 'POST', data: $scope.editFeed, url: '/api/feeds/' + $scope.editFeed._id}).
    success(function(data, status, headers, config) { 
      $scope.feeds[$scope.editFeedId] = data;
      $('#modFeed').modal('hide');
    });
  }
  
  $scope.addTag = function() {
    if ($scope.editFeed.tags == undefined)
      $scope.editFeed.tags = []
    if ($scope.editFeed.tags.indexOf(editFeedForm.editTag.value) == -1)
      $scope.editFeed.tags.push(editFeedForm.editTag.value);
  }
  
  $scope.deleteTag = function(id) {
    $scope.editFeed.tags.splice(id, 1);
  }

}