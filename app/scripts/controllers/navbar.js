'use strict';

angular.module('reversiApp')
  .controller('NavbarCtrl', function ($scope, $location, $firebase, $firebaseSimpleLogin) {
    $scope.menu = [
    {
      'title': 'Home',
      'link': '/'
    },
    {
      'title': 'Leaderboards',
      'link': '/leaderboard'
    }];
    
    $scope.isActive = function(route) {
      return route === $location.path();
    };

    var ref = new Firebase('https://reversibot.firebaseio.com');
    $scope.auth = $firebaseSimpleLogin(ref);

  });
