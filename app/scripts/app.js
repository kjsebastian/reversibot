'use strict';

angular.module('reversiApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'firebase'
])
.config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'partials/main',
        controller: 'MainCtrl'
      })
      .when('/leaderboard', {
        templateUrl: 'partials/leaderboard',
        controller: 'LeaderBoardCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
      
    $locationProvider.html5Mode(true);
})
.factory('User', function() {
    var name, id;

    return {
        getUser: function(){
            return {'name': name, 'id': id};
        },
        setUser: function(user) {
            name = user.name;
            id = user.id;
        }
    };
});