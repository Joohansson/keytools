const gulp = require('gulp');
const zip = require('gulp-zip');

gulp.task('zip', () =>
  gulp.src('build/**')
    .pipe(zip('keytools.zip'))
    .pipe(gulp.dest('.'))
);
