var gulp = require('gulp');
var i18n = require('gulp-html-i18n');

gulp.task('build:localize', function() {
  var dest  = './public';
  var index = './index.html';
 
  return gulp.src(index)
    .pipe(i18n({
      langDir: './lang',
      trace: true
    }))
    .pipe(gulp.dest(dest));
});

gulp.task('watch', function() {
  gulp.watch('./index.html', ['build:localize']);
});

gulp.task('default', function() {
    gulp.start('watch');
});