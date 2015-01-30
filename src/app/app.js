'use strict';

try { angular.module('app.templates'); } catch(e) { angular.module('app.templates', []); }

angular.module('app', [
  'ui.router',
  'app.auth',
  'cfp.hotkeys',
  'angulartics',
  'angulartics.google.analytics'
])
  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: "/",
        templateUrl: "src/app/views/home.html"
      })
      .state('report', {
        authenticated: true,
        url: "/report",
        controller: 'reportCtrl',
        templateUrl: "src/app/views/report.html"
      })
      .state('addContact', {
        authenticated: true,
        url: "/addContact",
        controller: 'addContactCtrl',
        templateUrl: "src/app/views/addContact.html"
      })
      .state('start', {
        authenticated: true,
        url: "/start",
        controller: 'startCtrl',
        templateUrl: "src/app/views/start.html"
      })
      .state('connection', {
        authenticated: true,
        url: "/connection/:idx",
        controller: 'connectionCtrl',
        templateUrl: "src/app/views/connection.html"
      })
      .state('login', {
        anonymous: true,
        url: "/login",
        controller: 'loginCtrl',
        templateUrl: "src/app/views/login.html"
      })
    ;
    $urlRouterProvider.otherwise('/');
  })
;