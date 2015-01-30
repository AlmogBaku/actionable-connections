'use strict';

module.exports = function(grunt) {

  var path = {
    src:        ".",
    build:      ".",
    tmp:        "tmp"
  };

  var files = {
    vendor: [
      "<%= path.src %>/node_modules/angular/angular.js",
      "<%= path.src %>/node_modules/ngauth/AuthBaseUI.js",
      "<%= path.src %>/node_modules/angular-ui-router/release/angular-ui-router.js",
      "<%= path.src %>/node_modules/angular-hotkeys/build/hotkeys.js",
      "<%= path.src %>/node_modules/angulartics/src/angulartics.js",
      "<%= path.src %>/node_modules/angulartics/src/angulartics-ga.js"
    ],
    modules: [
      "<%= path.src %>/src/*/*.js",
      "<%= path.src %>/src/*/*/*.js",

      "!<%= path.src %>/src/app/*.js",
      "!<%= path.src %>/src/app/**/*.js"
    ],
    app: [
      "<%= path.src %>/src/app/*.js",
      "<%= path.src %>/src/app/*/*.js",
      "<%= path.src %>/src/*.js"
    ],
    views: [
      "<%= path.src %>/**/views/*.html"
    ]
  };

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    path: path,
    meta: {
      banner: '/**\r\n' +
      ' ******* <%= pkg.name %> *******\r\n' +
      ' * <%= pkg.description %>\r\n' +
      ' * @version v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\r\n' +
      ' * @link <%= pkg.homepage %>\r\n' +
      ' * @author <%= pkg.author %>\r\n' +
      ' * @license <%= pkg.license %>\r\n' +
      ' */\r\n'
    },
    uglify: {
      options: {
        banner: '<%= meta.banner %>',
        useStrict: false
//                beautify: true
      },
      build: {
        files: {
          '<%= path.build %>/js/<%= pkg.name %>.<%= pkg.version %>.min.js': [
            '<%= path.tmp %>/js/<%= pkg.name %>.vendor.js',
            '<%= path.tmp %>/js/<%= pkg.name %>.tpl.js',
            '<%= path.tmp %>/js/<%= pkg.name %>.modules.js'
          ],
          '<%= path.build %>/js/<%= pkg.name %>.<%= pkg.version %>.app.min.js': ["<%= path.tmp %>/js/<%= pkg.name %>.app.js"]
        }
      }
    },
    ngAnnotate: {
      build: {
        files: {
          '<%= path.tmp %>/js/<%= pkg.name %>.vendor.js': files.vendor,
          '<%= path.tmp %>/js/<%= pkg.name %>.modules.js':  files.modules,
          '<%= path.tmp %>/js/<%= pkg.name %>.app.js':  files.app
        }
      }
    },
    compass: {
      build: {
        options: {
          basePath: "<%= path.src %>/",
          config: "<%= path.src %>/config.rb",
          environment: "production",
          force: true
        }
      },
      dev: {
        options: {
          basePath: "<%= path.src %>/",
          config: "<%= path.src %>/config.rb",
          environment: "development",
          watch: true
        }
      }
    },
    copy: {
      dev: {
        files: [
          {
            src:  ["<%= path.tmp %>/_index.html"],
            dest: "<%= path.src %>/dev.html"
          }
        ]
      },
      build: {
        files: [
          {
            src:  ["<%= path.tmp %>/_index.html"],
            dest: "<%= path.src %>/index.html"
          }
        ]
      }
    },
    htmlrefs: {
      build: {
        src: ["<%= path.src %>/_index.html"],
        dest: "<%= path.tmp %>/_index.html",
        options: {
          version: "<%= pkg.version %>",
          name:   "<%= pkg.name %>"
        }
      }
    },
    html2js: {
      build: {
        src:    files.views,
        dest:   "<%= path.tmp %>/js/<%= pkg.name %>.tpl.js",
        module: "app.templates"
      }
    },
    clean: {
      clearTmp:       ["<%= path.tmp %>"],
      dev:            ["<%= path.tmp %>","<%= path.src %>/dev.html"]
    },
    htmlbuild: {
      dev: {
        src: '<%= path.src %>/_index.html',
        dest: '<%= path.tmp %>',
        options: {
          relative: false,
          scripts: {
            js: files.vendor.concat(files.modules).concat(files.app)
          },
          styles: {
            css: ["<%= path.src %>/assets/css/style.css"]
          }
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-htmlrefs');
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-html-build');
  grunt.loadNpmTasks('grunt-ng-annotate');
  // Default task(s).
  grunt.registerTask('build', [
    'clean:clearTmp',
    'ngAnnotate:build',
    'html2js:build',
    'uglify:build',
    'htmlrefs:build',
    'copy:build',
    'clean:clearTmp',
    'compass:build'
  ]);

  grunt.registerTask('dev', [
    'clean:dev',
    'htmlbuild:dev',
    'copy:dev',
    'clean:clearTmp',
    'compass:dev'
  ]);
};