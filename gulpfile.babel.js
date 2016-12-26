'use strict';

import gulp from 'gulp';
import babel from 'gulp-babel';
import del from 'del';
import jsdoc from 'gulp-jsdoc3';
import fs from 'fs-extra';
import _ from 'lodash';
import path from 'path';
import inject from 'gulp-inject';

import pkg from './package.json';
import jsdocConfig from './jsdoc.json';

const config = {
  src: [`src/**/*.js`, `!src/plugins/**/*`, `!src/public/**/*`],
  views: `src/views/**/*`,
  public: `src/public/**/*`,
  dist: `dist`
};

/**
 * Read package.json depedencies, write away to `macguvyer.json` and copy package to `src/plugins`
 * @method macgyver
 */
function macgyver() {
  let details;
  let depPkg = null;
  let entry  = {
    module: null,
    name: null,
    js: null,
    css: null,
    priority: 50
  };
  if (fs.existsSync(`./macgyver.json`)) {
    details = fs.readJSONSync(`./macgyver.json`);
  } else {
    details = [];
  }

  _.forEach(pkg.optionalDependencies, (item, key) => {
    let found = _.find(details, {
      module: key
    });
    if (!found) {
      console.log(`no ${key} in macguyer`);
      depPkg = JSON.parse(fs.readFileSync(`./node_modules/${key}/package.json`, `utf8`));
      let data = _.clone(entry);
      data.module = key;

      if (depPkg.main && depPkg.main !== ``) {
        data.js = [].concat(depPkg.main);
      }

      if (depPkg.style && depPkg.style !== ``) {
        data.css = depPkg.style;
      }
      details.push(data);
    }
  });

  fs.writeFileSync(`./macgyver.json`, JSON.stringify(details, null, 2), `utf8`);

  fs.emptyDirSync(`./src/plugins`);

  for (let item of details) {
    fs.copySync(`./node_modules/${item.module}`, `./src/plugins/${item.module}`, {
      clobber: true
    });
  }
}

/**
 * Loop over deps, sort by priority and return object containing paths.
 * @method findMacgyverDeps
 * @return {{css:Array<string>, js:Array<string>, assets:Array<string>}} paths to dependencies
 */
function findMacgyverDeps() {
  let details = JSON.parse(fs.readFileSync(`./macgyver.json`, `utf8`));
  let deps    = {
    css: [],
    js: [],
    assets: []
  };
  details.sort((a, b) => {
    if (a.priority > b.priority) {
      return 1;
    }
    if (a.priority < b.priority) {
      return -1;
    }
    // a must be equal to b, so return 0
    return 0;
  });

  for (let item of details) {
    let name = item.name || item.module;
    let css  = item.css ? [].concat(item.css) : null;
    if (css) {
      for (let c of css) {
        deps.css.push((`${config.dist}/public/plugins/${name}/${c}`));
      }
    }
    if (item.js) {
      for (let j of item.js) {
        deps.js.push((`${config.dist}/public/plugins/${name}/${j}`));
      }
    }

    // asset paths are not resolved on purpose
    if (item.assets) {
      name = item.base ? `${name}/${item.base}` : name;
      for (let j of item.assets) {
        deps.assets.push(`${config.dist}/public/plugins/${name}/${j}`);
      }
    }
  }

  return deps;
}

gulp.task(`babel`, () => {
  return gulp.src(config.src)
    .pipe(babel())
    .pipe(gulp.dest(config.dist));
});

// =============================================================================
// jsdoc generation
gulp.task(`docs`, () => {
  return gulp.src([`README.md`, `./src/**/*.js`, `!src/plugins/**/*`, `!src/public/**/*`], {
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

gulp.task(`clean:plugins`, () => {
  return del(config.dist + `/plugins`);
});

// =============================================================================
// handle plugins
gulp.task(`plugins`, gulp.series(`clean:plugins`, () => {
  return gulp.src([`./src/plugins/**/*`], {
    base: `src`
  })
    .pipe(gulp.dest(config.dist + '/public'));
}));

gulp.task(`macgyver:build`, cb => {
  macgyver();
  cb();
});

// =============================================================================
// inject frontend dependencies into `dist` index.html
// if it is compressed, then inject the vendor scripts
gulp.task(`macgyver:inject`, () => {
  let deps = findMacgyverDeps();

  return gulp.src(`${config.dist}/views/layout.hbs`)
    .pipe(inject(gulp.src(deps.css, {
      read: false
    }), {
      name: `macgyver`,
      relative: false,
      ignorePath: `${config.dist}/public`
    }))
    .pipe(inject(gulp.src(deps.js, {
      read: false
    }), {
      name: `macgyver`,
      relative: false,
      ignorePath: `${config.dist}/public`

    }))
    .pipe(gulp.dest(`${config.dist}/views/`));
});

// =============================================================================
// frontend dependencies driver task
gulp.task(`macgyver`, gulp.series(`macgyver:build`, `plugins`, `macgyver:inject`));

gulp.task(`build`, gulp.series(`clean`, `babel`, `docs`, `public`, `views`, `macgyver`));

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
