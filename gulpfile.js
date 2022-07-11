var gulp =  require('gulp');
var imagemin = require('gulp-imagemin');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var browserSync = require('browser-sync').create();
var gulp = require('gulp');
// var mustache = require('gulp-mustache');
var handlebars = require('gulp-compile-handlebars');
var rename = require('gulp-rename');

//Copy all HTML to dist
gulp.task('copyHTML',function () {
  gulp.src('src/*.html')
  .pipe(gulp.dest('dist'));
});

//Optimize images
gulp.task('imagemin', function () {
    gulp.src('src/assets/img/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/assets/img'));
});

//Minify JS
gulp.task('minifyJS',function () {
  gulp.src('src/assets/js/*.js')
  .pipe(uglify())
  .pipe(gulp.dest('dist/assets/js'));
});

//Compile SASS
gulp.task('sass',function () {
  gulp.src('src/assets/scss/*.scss')
  .pipe(sourcemaps.init())
  .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('dist/assets/css'));
});

//Copy Vendor
gulp.task('copyVendor',function() {
  gulp.src('src/vendor/**/*')
  .pipe(gulp.dest('dist/vendor/'));
});

//Copy fonts
gulp.task('copyFonts',function() {
  gulp.src('src/assets/fonts/**/*')
  .pipe(gulp.dest('dist/assets/fonts/'));
});

gulp.task('default', ['copyHTML', 'hbs', 'imagemin', 'minifyJS', 'sass', 'copyVendor', 'copyFonts','serve','watch']);

// Static Server + watching scss/html files
gulp.task('serve', function() {
    browserSync.init({
        server: "./dist"
    });
});

//Convert template to html
gulp.task('hbs', function ()  {
  return gulp.src('src/*.hbs').pipe(handlebars({}, {
      ignorePartials: false,
      batch: ['src/templates']
    })).pipe(rename({
      extname: '.html'
    })).pipe(gulp.dest('dist/'));
});

//Task to watch any changes in real time in Devlopment
gulp.task('watch',  function () {
  gulp.watch('src/assets/js/*.js', ['minifyJS']);
  gulp.watch('src/assets/img/*', ['imagemin']);
  gulp.watch('src/assets/scss/*.scss', ['sass']);
  gulp.watch('src/templates/*.hbs', ['hbs']);
  gulp.watch('src/*.hbs', ['hbs']);
  gulp.watch('src/*.html', ['copyHTML']);
  gulp.watch(['src/templates/*.hbs','src/*.hbs', 'src/assets/scss/*', 'src/assets/js/*']).on('change', browserSync.reload);
});
