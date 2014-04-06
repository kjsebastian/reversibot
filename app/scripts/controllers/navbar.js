'use strict';

angular.module('reversiApp')
  .controller('NavbarCtrl', function ($rootScope, $scope, $location, $firebase, $firebaseSimpleLogin, User) {
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
    // User.setUser($scope.auth.user);

    $rootScope.$on("$firebaseSimpleLogin:login", function(e, user) {
      User.setUser(user);
    });
  });
