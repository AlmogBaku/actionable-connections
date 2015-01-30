'use strict';

angular.module('app.auth', ['ngAuthBase'])
    .factory('Auth', function($linkedin, AuthBaseUI, $rootScope) {
        var Auth = angular.extend(AuthBaseUI,  {});
        Auth.setSecuredPath("start");

        Auth.setIsLoggedIn(function() {
            return $linkedin.getStatus();
        });

        Auth.login = $linkedin.login;
        Auth.logout = $linkedin.logout;

        $rootScope.$on("linkedIn.status", function() {
            Auth.statusChanged($linkedin.getStatus());
        });

        return Auth;
    })
    .run(['Auth', function(Auth) {}])
;