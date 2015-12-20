var gulp 			= require('gulp');
var uglify 			= require('gulp-uglify');
var concat 			= require('gulp-concat');
var ngAnnotate 		= require('gulp-ng-annotate');
 
gulp.task('compress', function() {
	return gulp.src('*.js')
		.pipe(uglify())
		.pipe(gulp.dest('dist'));
});
 
gulp.task('compress-mobile', function() {
	return gulp.src('./public/mobile/**/*.js')
		.pipe(concat('mobile.js'))
		.pipe(gulp.dest('dist'));
});
gulp.task('uglify-mobile', function() {
	return gulp.src('./dist/mobile.js')
		.pipe(ngAnnotate())
		.pipe(uglify())
		.pipe(gulp.dest('dist'));
}); 
gulp.task('compress-pc', function() {
	return gulp.src('./public/pc/**/*.js')
		.pipe(concat('pc.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist'));
});
gulp.task('compress-settings', function() {
	return gulp.src('./public/settings/**/*.js')
		.pipe(concat('settings.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist'));
});
gulp.task('compress-server', function() {
	return gulp.src('./server.js')
		.pipe(concat('server.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist'));
});
gulp.task('default', ['compress-mobile','compress-settings' , 'compress-pc']);