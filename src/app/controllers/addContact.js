/*
 * Authored by  AlmogBaku
 *              almog.baku@gmail.com
 *              http://www.almogbaku.com/
 *
 * 18/01/15 00:23
 */
 
'use strict';


angular.module('app')
  .controller('addContactCtrl', function($scope, $linkedin, $state, $rootScope, hotkeys, $timeout) {
    if(!$rootScope.loggedIn){
      $state.go('home');
      return;
    }

    $scope.error=false;
    $scope.success = false;
    $scope.add = function() {
      $linkedin.addConnectionByUrl($scope.connUrl)
        .then(function() {
          $scope.success = true;
          $scope.error = false;
          $timeout(function() {
            $state.go('report');
          },1500);
        })
        .catch(function(err) {
          $scope.error=err.message;
        })
      ;
    };

    var firstNotFlagged = $linkedin.getFirstNotFlagged();
    if(firstNotFlagged!==false) {
      hotkeys.bindTo($scope)
        .add({
          combo: 'j',
          description: 'Jump back to the first skipped connection',
          callback: function() {
            $state.go("connection", {idx: firstNotFlagged.idx });
          }
        })
        .add({
          combo: 'r',
          description: 'Go back to the results report',
          callback: function() {
            $state.go("report");
          }
        })
      ;
    }
  })
;