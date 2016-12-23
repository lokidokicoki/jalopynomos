'use strict';

import gulp from 'gulp';
import babel from 'gulp-babel';
import del from 'del';

const config = {
  src: `src/**/*.js`,
  dist: `dist`
};

gulp.task(`babel`, () => {
  return gulp.src(config.src)
    .pipe(babel())
    .pipe(gulp.dest(config.dist));
});

gulp.task(`clean`, () => {
  return del(config.dist);
});

gulp.task(`build`, gulp.series(`clean`, `babel`));

gulp.task(`watch:js`, () => {
  gulp.watch(config.src, gulp.series(`babel`));
});

gulp.task(`watch`, gulp.parallel(
  `watch:js`
));

gulp.task(`default`, gulp.series(`build`, `watch`));
