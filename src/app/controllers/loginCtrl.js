/*
 * Authored by  AlmogBaku
 *              almog.baku@gmail.com
 *              http://www.almogbaku.com/
 *
 * 18/01/15 00:23
 */
 
'use strict';


angular.module('app')
  .controller('loginCtrl', function($scope, Auth) {
    $scope.login = Auth.login;
  })
;