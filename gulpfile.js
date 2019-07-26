(() => {

  'use strict';

  /**************** gulpfile.js configuration ****************/

  const

    // development or production
    devBuild  = ((process.env.NODE_ENV || 'development').trim().toLowerCase() === 'development'),

    // directory locations
    dir = {
      assets      : 'assets/',
      build       : 'build/'
    },

    // modules
    gulp          = require('gulp'),
    noop          = require('gulp-noop'),
    newer         = require('gulp-newer'),
    size          = require('gulp-size'),
    imagemin      = require('gulp-imagemin'),
    sass          = require('gulp-sass'),
    postcss       = require('gulp-postcss'),
    sourcemaps    = devBuild ? require('gulp-sourcemaps') : null,
    browsersync   = devBuild ? require('browser-sync').create() : null;

  console.log('Gulp', devBuild ? 'development' : 'production', 'build');


  /**************** clean task ****************/

  function clean() {

    return del([ dir.build ]);

  }
  exports.clean = clean;
  exports.wipe = clean;


  /**************** images task ****************/

  const imgConfig = {
    assets        : dir.assets + 'images/**/*',
    build         : dir.build + 'images/',
    minOpts: {
      optimizationLevel: 5
    }
  };

  function images() {

    return gulp.src(imgConfig.assets)
      .pipe(newer(imgConfig.build))
      .pipe(imagemin(imgConfig.minOpts))
      .pipe(size({ showFiles:true }))
      .pipe(gulp.dest(imgConfig.build));

  }
  exports.images = images;


  /**************** CSS task ****************/

  const cssConfig = {

    assets      : dir.assets + 'scss/main.scss',
    watch       : dir.assets + 'scss/**/*',
    build       : dir.build + 'css/',
    sassOpts: {
      sourceMap       : devBuild,
      imagePath       : '/images/',
      precision       : 3,
      errLogToConsole : true
    },

    postCSS: [
      require('usedcss')({
        html: ['index.html']
      }),
      require('postcss-assets')({
        loadPaths: ['images/'],
        basePath: dir.build
      }),
      require('autoprefixer')({
        browsers: ['> 1%']
      }),
      require('cssnano')
    ]

  };


  function css() {

    return gulp.src(cssConfig.assets)
      .pipe(sourcemaps ? sourcemaps.init() : noop())
      .pipe(sass(cssConfig.sassOpts).on('error', sass.logError))
      .pipe(postcss(cssConfig.postCSS))
      .pipe(sourcemaps ? sourcemaps.write() : noop())
      .pipe(size({ showFiles: true }))
      .pipe(gulp.dest(cssConfig.build))
      .pipe(browsersync ? browsersync.reload({ stream: true }) : noop());

  }
  exports.css = gulp.series(images, css);


  /**************** server task (private) ****************/

  const syncConfig = {
    server: {
      baseDir   : './',
      index     : 'index.php'
    },
    port        : 8000,
    open        : true
  };

  // browser-sync
  function server(done) {
    if (browsersync) browsersync.init(syncConfig);
    done();
  }


  /**************** watch task (private) ****************/

  function watch(done) {

    // image changes
    gulp.watch(imgConfig.assets, images);

    // CSS changes
    gulp.watch(cssConfig.watch, css);

    done();

  }

  /**************** default task ****************/

  exports.default = gulp.series(exports.css, watch, server);

})();