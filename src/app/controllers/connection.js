/*
 * Authored by  AlmogBaku
 *              almog.baku@gmail.com
 *              http://www.almogbaku.com/
 *
 * 18/01/15 00:23
 */
 
'use strict';


angular.module('app')
  .controller('connectionCtrl', function($scope, $linkedin, $state, $rootScope, $stateParams, hotkeys, $analytics) {
    if(!$rootScope.loggedIn){
      $state.go('home');
      return;
    }

    $analytics.pageTrack('/connection');

    $scope.connection = $linkedin.getConnectionByIdx($stateParams.idx);
    $scope.last = $linkedin.getLastConnectionIdx();


    function flag(e, hotkey) {
      var flag = hotkey.combo[0];
      $scope.connection.flag(flag);
      $analytics.eventTrack('flag', { flag: flag });
      next();
    }
    function next() {
      if($scope.connection.idx===$scope.last) {
        $state.go("finish");
      } else {
        $state.go("connection", {idx: $scope.connection.idx+1 });
      }
    }

    hotkeys.bindTo($scope)
      .add({
        combo: ['n','3'],
        description: 'Need intro',
        callback: flag
      })
      .add({
        combo: ['0', 'x'],
        description: 'Not relevant',
        callback: flag
      })
      .add({
        combo: '1',
        description: 'Will help',
        callback: flag
      })
      .add({
        combo: '2',
        description: 'Will help a lot! (good-friend)',
        callback: flag
      })
      .add({
        combo: 'right',
        description: 'Next (skip)',
        callback: next
      })
      .add({
        combo: 'j',
        description: 'Jump back to the first skipped connection',
        callback: function() {
          var conn = $linkedin.getFirstNotFlagged();
          if(conn===false) {
            $state.go("finish");
          } else {
            $state.go("connection", {idx: conn.idx });
          }
        }
      })
      .add({
        combo: 'r',
        description: 'Skip to the results report',
        callback: function() {
          $state.go("report");
        }
      })
    ;

    //back
    if($scope.connection.idx>0) {
      hotkeys.bindTo($scope)
        .add({
          combo: 'left',
          description: 'back',
          callback: function() {
            if($scope.connection.idx>0) {
              $state.go("connection", {idx: $scope.connection.idx-1 });
            }
          }
        })
      ;
    }
  })
;