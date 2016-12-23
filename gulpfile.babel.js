'use strict';

import gulp from 'gulp';
import babel from 'gulp-babel';
import del from 'del';
import jsdoc from 'gulp-jsdoc3';


import jsdocConfig from './jsdoc.json';

const config = {
  src: [`src/**/*.js`, `!src/public/**/*`],
  views: `src/views/**/*`,
  public: `src/public/**/*`,
  dist: `dist`
};

gulp.task(`babel`, () => {
  return gulp.src(config.src)
    .pipe(babel())
    .pipe(gulp.dest(config.dist));
});

// =============================================================================
// jsdoc generation
gulp.task(`docs`, () => {
  return gulp.src([`README.md`, `./src/**/*.js`, `!src/public/**/*`], {
    read: false
  }).pipe(jsdoc(jsdocConfig));
});

gulp.task(`views`, () => {
  return gulp.src(config.views, {
    base: `src`
  })
    .pipe(gulp.dest(config.dist));
});

gulp.task(`public`, () => {
  return gulp.src(config.public, {
    base: `src`
  })
    .pipe(gulp.dest(config.dist));
});

gulp.task(`clean`, () => {
  return del(config.dist);
});

gulp.task(`build`, gulp.series(`clean`, `babel`, `docs`, `public`, `views`));

gulp.task(`watch:js`, () => {
  gulp.watch(config.src, gulp.series(`babel`, `docs`));
});

gulp.task(`watch:public`, () => {
  gulp.watch(config.public, gulp.series(`public`));
});

gulp.task(`watch:views`, () => {
  gulp.watch(config.views, gulp.series(`views`));
});

gulp.task(`watch`, gulp.parallel(
  `watch:js`,
  `watch:public`,
  `watch:views`
));

gulp.task(`default`, gulp.series(`build`, `watch`));
