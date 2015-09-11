var fs = require('fs');
var gulp = require('gulp');
var jshint = require('gulp-jshint');

var pkg = require('./package.json');

gulp.task('default', ['lint-server', 'lint-client']);

gulp.task('lint-client', function() {
  return gulp.src('./client/www/src/**/*.js')
    .pipe(jshint({predef: ['angular', 'PouchDB', 'console'], globalstrict: true}))
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('lint-server', function() {
  return gulp.src('./server/**/*.js')
    .pipe(jshint({node: true}))
    .pipe(jshint.reporter('jshint-stylish'));
});

