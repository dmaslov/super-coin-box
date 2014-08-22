var gulp = require('gulp'),
  jsmin = require('gulp-jsmin'),
  rename = require('gulp-rename'),
  imagemin = require('gulp-imagemin'),
  pngcrush = require('imagemin-pngcrush'),
  concat = require('gulp-concat');

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
            use: [pngcrush()]
        }))
        .pipe(gulp.dest(srcPath + '/assets/images/'));
});

gulp.task('watch', function(){
  gulp.watch(paths.js, ['js-minifier']);
  //gulp.watch(paths.images, ['image-minifier']);
});

gulp.task('default', ['js-minifier', 'image-minifier', 'watch']);
