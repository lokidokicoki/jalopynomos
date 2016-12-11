'use strict';

import gulp from 'gulp';
import babel from 'gulp-babel';
import runSequence from 'run-sequence';
import del from 'del';

const config = {
  src: 'src/**/*.js',
  dest: 'build'
};

gulp.task(`babel`, function() {
  return gulp.src(config.src)
    .pipe(babel())
    .pipe(gulp.dest(config.dest));
});

gulp.task(`clean`, () => {
  return del(config.dist);
});

gulp.task(`build`, cb => {
  runSequence(`clean`, `babel`, cb);
});

gulp.task(`watch`, [`build`], () => {
  gulp.watch(config.src, [`babel`]);
});

gulp.task(`default`, [`watch`]);
