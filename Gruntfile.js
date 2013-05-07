module.exports = function(grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-shell');

  var mochaShelljsOpt = {stdout: true, stderr: false};

  grunt.initConfig({
    jshint: {
      src: {
        files: {
          src: ['index.js', 'lib/**/*.js']
        }
      },
      grunt: {
        files: {
          src: ['Gruntfile.js']
        }
      },
      tests: {
        options: {
          expr: true
        },
        files: {
          src: ['test/**/*.js']
        }
      },
      json: {
        files: {
          src: ['*.json']
        }
      }
    },
    uglify: {
      dist: {
        options: {
          compress: false,
          mangle: false,
          beautify: true
        },
        files: {
          'dist/sinon-doublist-fs.js': 'dist/sinon-doublist-fs.js'
        }
      }
    },
    shell: {
      options: {
        failOnError: true
      },
      build: {
        command: 'component install --dev && component build --standalone sinonDoublistFs --name sinon-doublist-fs --out dist --dev'
      },
      dist: {
        command: 'component build --standalone sinonDoublistFs --name sinon-doublist-fs --out dist'
      },
      test_lib: {
        options: mochaShelljsOpt,
        command: 'mocha --colors --async-only --recursive --reporter spec test/lib'
      },
      test_mocha: {
        options: mochaShelljsOpt,
        command: 'mocha --colors --async-only --reporter spec test/mocha.js'
      },
      dox_lib: {
        command: 'gitemplate-dox --input lib/sinon-doublist-fs/index.js --output docs/sinon-doublist-fs.md'
      }
    }
  });

  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('dox', ['shell:dox_lib']);
  grunt.registerTask('build', ['default', 'shell:build']);
  grunt.registerTask('dist', ['default', 'shell:dist', 'uglify:dist', 'dox']);
  grunt.registerTask('test', ['build', 'shell:test_lib', 'shell:test_mocha']);
};
