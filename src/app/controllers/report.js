/*
 * Authored by  AlmogBaku
 *              almog.baku@gmail.com
 *              http://www.almogbaku.com/
 *
 * 18/01/15 00:23
 */
 
'use strict';


angular.module('app')
  .controller('reportCtrl', function($scope, $linkedin, $state, $rootScope, hotkeys, exportCSV) {
    if(!$rootScope.loggedIn){
      $state.go('home');
      return;
    }

    $linkedin.getGroupedConnections().then(function(connections) {
      $scope.connections = connections;
    });
    $scope.exportCSV = function() {
      $linkedin.toObject().then(function(obj) {
        exportCSV(obj, 'connections', true);
      });
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
          combo: 'a',
          description: 'Add contact that not on your LinkedIn connections',
          callback: function() {
            $state.go("addContact");
          }
        })
        .add({
          combo: 'e',
          description: 'Export',
          callback: $scope.exportTbl
        })
      ;
    }
  })
;