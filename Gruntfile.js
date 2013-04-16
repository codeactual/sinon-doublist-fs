module.exports = function(grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-shell');

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
        failOnError: true,
        stdout: true,
        stderr: true
      },
      build: {
        command: 'component install --dev && component build --standalone sinonDoublistFs --name sinon-doublist-fs --out dist --dev'
      },
      dist: {
        command: 'component build --standalone sinonDoublistFs --name sinon-doublist-fs --out dist'
      },
      test_lib: {
        command: 'mocha --colors --async-only --recursive --reporter spec test/lib'
      },
      test_mocha: {
        command: 'mocha --colors --async-only --reporter spec test/mocha.js'
      }
    }
  });

  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('build', ['default', 'shell:build']);
  grunt.registerTask('dist', ['default', 'shell:dist', 'uglify:dist']);
  grunt.registerTask('test', ['default', 'shell:test_lib', 'shell:test_mocha']);
};
