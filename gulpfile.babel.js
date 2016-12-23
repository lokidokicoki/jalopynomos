'use strict';

import gulp from 'gulp';
import babel from 'gulp-babel';
import del from 'del';

const config = {
  src: `src/**/*.js`,
  views: `src/views/**/*`,
  dist: `dist`
};

gulp.task(`babel`, () => {
  return gulp.src(config.src)
    .pipe(babel())
    .pipe(gulp.dest(config.dist));
});

gulp.task(`views`, () => {
  return gulp.src(config.views, {
    base: `src`
  })
    .pipe(gulp.dest(config.dist));
});

gulp.task(`clean`, () => {
  return del(config.dist);
});

gulp.task(`build`, gulp.series(`clean`, `babel`, `views`));

gulp.task(`watch:js`, () => {
  gulp.watch(config.src, gulp.series(`babel`));
});

gulp.task(`watch:views`, () => {
  gulp.watch(config.views, gulp.series(`views`));
});

gulp.task(`watch`, gulp.parallel(
  `watch:js`,
  `watch:views`
));

gulp.task(`default`, gulp.series(`build`, `watch`));
