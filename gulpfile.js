var gulp = require('gulp'),
  jsmin = require('gulp-jsmin'),
  rename = require('gulp-rename'),
  imagemin = require('gulp-imagemin'),
  optipng = require('imagemin-optipng'),
  cssmin = require('gulp-cssmin'),
  concat = require('gulp-concat'),
  connect = require('gulp-connect');

var srcPath = 'public';
var paths = {
  js: [
    srcPath + '/js/**/*.js',
    '!' + srcPath + '/js/*.min.js'
  ],

  jsMinified: [
    'bower_components/phaser/build/phaser.min.js',
    srcPath + '/js/all.min.js',
  ],

  mapFile: ['bower_components/phaser/build/phaser.map'],

  images: [
    srcPath + '/assets/images/*',
    '!' + srcPath + '/assets/images/*.map',
  ],

  css: [
    srcPath + '/css/*',
    '!' + srcPath + '/css/*.min.css',
   ]
};

var copyMapFile = function(){
  gulp.src(paths.mapFile)
    .pipe(gulp.dest(srcPath + '/js/'));
};

var jsGluer = function(){
  gulp.src(paths.jsMinified)
    .pipe(concat('tmp.js'))
    .pipe(rename('all.min.js'))
    .pipe(gulp.dest(srcPath + '/js/'))
    .on('end', copyMapFile);
};

gulp.task('js-minifier', function() {
  gulp.src(paths.js)
    .pipe(concat('tmp.js'))
    .pipe(rename('all.min.js'))
    .pipe(jsmin())
    .pipe(gulp.dest(srcPath + '/js/'))
    .on('end', jsGluer);
});

gulp.task('image-minifier', function () {
    return gulp.src(paths.images)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use:[optipng({optimizationLevel: 7})]
        }))
        .pipe(gulp.dest(srcPath + '/assets/images/'));
});

gulp.task('css-minifier', function () {
    gulp.src(paths.css)
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(srcPath + '/css/'));
});

gulp.task('server', function() {
  connect.server({
    root: 'public',
    port: 8080,
    livereload: false
  });
});

gulp.task('watch', function(){
  gulp.watch(paths.js, ['js-minifier']);
  gulp.watch(paths.css, ['css-minifier']);
});

gulp.task('default', ['js-minifier', 'image-minifier', 'css-minifier', 'watch']);
