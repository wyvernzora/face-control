/**
 * gulpfile.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

const gulp         = require('gulp');

const fs           = require('fs');
const del          = require('del');
const babel        = require('gulp-babel');
const eslint       = require('gulp-eslint');
const notify       = require('gulp-notify');
const changed      = require('gulp-changed');
const sourcemaps   = require('gulp-sourcemaps');

/*!
 * Load plugin configuration files.
 */
const eslintrc     = JSON.parse(fs.readFileSync('.eslintrc'));
const babelrc      = JSON.parse(fs.readFileSync('.babelrc'));


/*!
 * Default build target.
 */
gulp.task('default', [ 'build' ]);


/*!
 * Delete previous builds.
 */
gulp.task('clean', function(cb) {
  del([ 'lib/**' ], cb);
});


/*!
 * Incremental build (use with watch).
 */
const build = function() {

  return gulp.src(['src/**/*.js'], { base: 'src' })
    .pipe(changed('lib'))
    .pipe(sourcemaps.init())
    .pipe(babel(babelrc))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('lib'))
    .pipe(notify({ message: 'Build Successful', onLast: true }));

};
gulp.task('build', ['lint'], build);
gulp.task('rebuild', [ 'relint' ], build);


/*!
 * Lint all source files.
 */
const lint = function() {

  return gulp.src(['src/**/*.js'])
    .pipe(changed('lib'))
    .pipe(eslint(eslintrc))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());

};
gulp.task('lint', lint);
gulp.task('relint', ['clean'], lint);


/*!
 * Automatically rebuild on save.
 */
gulp.task('watch', ['rebuild'], function() {
  gulp.watch('src/**/*.js', ['build']);
});
