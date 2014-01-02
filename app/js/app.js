'use strict';

/* App Module */

var phonecatApp = angular.module('phonecatApp', [
  'ngRoute',
  'phonecatAnimations',
  'phonecatControllers',
  'phonecatFilters',
  'phonecatServices',
  'ChatXMPP',
  'imageupload'
]);

phonecatApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/chats', {
        templateUrl: 'partials/chat.html',
        controller: 'ChatCtrl'
      }).
      when('/room/:roomName', {
        templateUrl: 'partials/room.html',
        controller: ChatRoomCtrl
      }).
      when('/login', {
        templateUrl: 'partials/login.html',
        controller: 'LoginCtrl'
      }).
      otherwise({
        redirectTo: '/login'
      });
  }]);
