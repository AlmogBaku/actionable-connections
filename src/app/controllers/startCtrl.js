/*
 * Authored by  AlmogBaku
 *              almog.baku@gmail.com
 *              http://www.almogbaku.com/
 *
 * 18/01/15 00:23
 */
 
'use strict';


angular.module('app')
  .controller('startCtrl', function($scope, $linkedin, $state, hotkeys) {
    $linkedin.getMe().then(function(me) {
      $scope.user = me;
    });

    $scope.ready=false;
    $linkedin.getConnections().then(function() {
      $scope.ready=true;
    }).catch(function() {
      $scope.error=true;
    });

    hotkeys.bindTo($scope)
      .add({
        combo: ['s','right'],
        description: 'start',
        callback: function() {
          if($scope.ready) {
            $state.go('connection', {idx:0});
          }
        }
      })
    ;
  })
;