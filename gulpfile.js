var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    ngAnnotate = require('gulp-ng-annotate'),
    gutil = require('gulp-util'),
    concat = require('gulp-concat'),
    karma = require('gulp-karma'),
    babel = require('gulp-babel');

var paths = {
    js: [
        'src/module.js',
        'templates/template.js',
        'src/config/**/*.js',
        'src/constants.js',
        'src/angular-osd-opentok.js',
        'src/services/**/*.js'
    ],
    test: [
        'bower_components/angular/angular.js',
        'bower_components/angular-resource/angular-resource.js',
        'bower_components/ng-lodash/build/ng-lodash.js',
        'bower_components/angular-mocks/angular-mocks.js',
        'src/module.js',
        'src/config/**/*.js',
        'templates/template.js',
        'src/constants.js',
        'src/angular-osd-opentok.js',
        'src/services/**/*.js',
        'src/sample.js',
        'test/**/*.js'
    ]
};

gulp.task('default', ['watch']);

gulp.task('build', ['js']);

gulp.task('js', function() {
    return gulp.src(paths.js)
        .pipe(concat('angular-osd-opentok.js'))
        .pipe(gulp.dest('./'))
        .pipe(babel())
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest('./'))
        .on('error', gutil.log);
});

gulp.task('watch', ['build'], function() {
    gulp.watch(paths.js, ['js', 'test']);
});

gulp.task('test', ['build'], function() {
    return gulp.src(paths.test)
        .pipe(karma({
            configFile: 'karma.conf.js',
            action: 'watch'

        }))
        .on('error', gutil.log);
});
