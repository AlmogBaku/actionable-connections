'use strict';

angular.module('app').service("$linkedin", function($rootScope, $q) {
  var IN=null;
  var profile_req_fields = ['id', 'first-name', 'last-name', 'headline', 'industry', 'picture-url', 'site-standard-profile-request', 'email-address', 'positions'];

  $rootScope.$on("linkedIn.load", function(e, IN_API) {
    IN = IN_API;
    function linkedinStatus() {
      $rootScope.$broadcast("linkedIn.status", IN.User.isAuthorized());
    }

    IN.Event.on(IN, 'auth', linkedinStatus);
    IN.Event.on(IN, 'logout', linkedinStatus);
    linkedinStatus();
  });

  this.getSDK = function() {
    return IN;
  };
  this.getStatus = function() {
    return IN.User.isAuthorized();
  };

  this.getMe = function() {
    var defer = $q.defer();

    IN.API.Profile("me")
      .result(function(data){
        defer.resolve(data.values[0]);
      })
      .error(function(err) {
        defer.reject(err);
      })
    ;

    return defer.promise;
  };


  /**
   * Connection storage
   */
  var connections = {};
  var connectionsArr = [];

  function getMutualConnections() {
    var defer = $q.defer();
    var user = this;

    IN.API.Raw("/people/"+user.id+"/relation-to-viewer/related-connections?count=99")
      .result(function(data){
        user.mutual = [];

        var values = data.values;
        if(values) {
          for(var i=0;i<values.length;i++) {
            user.mutual.push(connections[values[i].id]);
          }
        }

        defer.resolve(user);
      })
      .error(function(err) {
        defer.reject(err);
      })
    ;

    return defer.promise;
  }
  function addConnection(user) {
    user.idx = connectionsArr.length;
    user.getMutualConnections = getMutualConnections;
    user.flag = function(flag) {
      if(flag===undefined) return this._flag;

      this._flag = flag;
      if(flag==='n') {
        this.getMutualConnections();
      }
    };
    if(user.siteStandardProfileRequest!==undefined) {
      user.url = user.siteStandardProfileRequest.url;
    }

    connections[user.id] = user;
    connectionsArr.push(connections[user.id]);
    return connections[user.id];
  }

  this.getConnections = function(force) {
    var defer = $q.defer();

    if(connectionsArr.length && !force) {
      defer.resolve(connections);
    } else {
      IN.API.Connections("me")
        .fields(profile_req_fields)
        .result(function (data) {
          var values = data.values.filter(function(user) {
            return user.id !== 'private';
          });
          for (var i = 0; i < values.length; i++) {
            addConnection(values[i]);
          }
          defer.resolve(connections);
        })
        .error(function(err) {
          defer.reject(err);
        })
      ;
    }

    return defer.promise;
  };
  this.getConnectionsArr = function(force) {
    var defer = $q.defer();

    if(connectionsArr.length && !force) {
      defer.resolve(connectionsArr);
    } else {
      this.getConnections(force)
        .then(function() {
          defer.resolve(connectionsArr);
        })
        .error(function(err) {
          defer.reject(err);
        })
      ;
    }
    return defer.promise;
  };

  this.getConnectionByID = function(id) {
    return connections[id];
  };
  this.getConnectionByIdx = function(idx) {
    return connectionsArr[idx];
  };
  this.getLastConnectionIdx = function() {
    return connectionsArr.length-1;
  };
  this.getFirstNotFlagged = function() {
    for(var i=0;i<connectionsArr.length;i++) {
      if(connectionsArr[i].flag()===undefined) return connectionsArr[i];
    }
    return false;
  };

  this.addConnectionByUrl = function(url, flag) {
    var defer = $q.defer();
    if(flag === undefined) flag='n';

    var $this = this;

    IN.API.Raw("/people/url="+encodeURIComponent(url)+":("+profile_req_fields.join(",")+")")
      .result(function(data){
        var conn = addConnection(data);
        conn.flag(flag);
        defer.resolve(conn);
      })
      .error(function(err) {
        defer.reject(err);
      })
    ;

    return defer.promise;
  };

  /**
   * Report
   */
  function flag2numberorder(flag) {
    switch(flag) {
      case '0': return -1;
      case 'n': return -2;
      case '1': return 1;
      case '2': return 2;
      default: return 0;
    }
  }
  this.getGroupedConnections = function() {
    var defer = $q.defer();

    var groupedConnections = {
      '0': [],
      'n': [],
      '1': [],
      '2': [],
      'skipped': []
    };
    this.getConnectionsArr().then(function(connectionsArr) {
      var conn;
      for(var i=0; i<connectionsArr.length; i++) {
        conn = connectionsArr[i];

        switch(conn.flag()) {
          case '0': groupedConnections['0'].push(conn); break;
          case 'n': groupedConnections['n'].push(conn); break;
          case '1': groupedConnections[1].push(conn); break;
          case '2': groupedConnections[2].push(conn); break;
          default: groupedConnections['skipped'].push(conn); break;
        }
      }
      for(i=0; i<groupedConnections['n'].length; i++) {
        conn = groupedConnections['n'][i];
        if(conn.mutual) {
          conn.mutual = conn.mutual.sort(function(a,b) {
            a=flag2numberorder(a.flag());
            b=flag2numberorder(b.flag());
            return b-a;
          });
        }
      }
      defer.resolve(groupedConnections);
    });

    return defer.promise;
  };
  this.toObject = function(){
    var defer = $q.defer();

    var obj = [];
    this.getConnectionsArr().then(function(connectionsArr) {
      var conn;
      for (var i = 0; i < connectionsArr.length; i++) {
        conn = connectionsArr[i];

        obj.push({
          'Flag': (conn.flag() === undefined) ? '' : conn.flag(),
          'First name': conn.firstName,
          'Last name': conn.lastName,
          'Headline': conn.headline,
          'Industry': conn.industry,
          'Url': conn.url,
          'Linkedin ID': conn.id
        });
      }
      defer.resolve(obj);
    });

    return defer.promise;
  };


  return this;
}).run(function($linkedin){});

function linkedin_load() {
  getApp("$rootScope").$broadcast("linkedIn.load", window.IN);
}