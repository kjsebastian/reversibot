'use strict';

angular.module('reversiApp')
  .controller('NavbarCtrl', function ($scope, $location) {
    $scope.menu = [
    {
      'title': 'Home',
      'link': '/'
    },
    {
      'title': 'Leaderboards',
      'link': '/leaderboard'
    },
    {
    	'title': 'Sign In',
    	'link': '#'
    }];
    
    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });
