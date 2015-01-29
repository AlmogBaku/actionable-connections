'use strict';

try { angular.module('app.templates'); } catch(e) { angular.module('app.templates', []); }

angular.module('app', [
  'ui.router',
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
        url: "/report",
        controller: 'reportCtrl',
        templateUrl: "src/app/views/report.html"
      })
      .state('addContact', {
        url: "/addContact",
        controller: 'addContactCtrl',
        templateUrl: "src/app/views/addContact.html"
      })
      .state('start', {
        url: "/start",
        controller: 'startCtrl',
        templateUrl: "src/app/views/start.html"
      })
      .state('connection', {
        url: "/connection/:idx",
        controller: 'connectionCtrl',
        templateUrl: "src/app/views/connection.html"
      })
      .state('login', {
        url: "/login",
        templateUrl: "src/app/views/login.html"
      })
    ;
    $urlRouterProvider.otherwise('/');
  })
  .run(function($rootScope, $state) {
    $rootScope.loggedIn = null;
    $rootScope.$on("linkedIn.status", function(e, status) {
      $rootScope.loggedIn = status;
      if(!status) {
        $state.go('login');
      } else {
        $state.go('start');
      }
    });
  })
;