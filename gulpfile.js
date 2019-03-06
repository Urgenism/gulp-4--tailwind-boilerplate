// package variable
const gulp = require("gulp");
const postcss = require("gulp-postcss");
const tailwindcss = require("tailwindcss");
const sass = require("gulp-sass");
const rename = require("gulp-rename");
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const imagemin = require('gulp-imagemin');
const uglify = require('gulp-uglify');
const plumber = require('gulp-plumber');
const newer = require('gulp-newer');
const del = require('del');

// path variable
const styleSrc = 'src/assets/scss/**/*.scss',
    styleDest = 'dist/assets/css/',
    htmlSrc = 'src/*.html',
    htmlDest = 'dist/*.html',
    vendorSrc = 'src/assets/js/vendors/',
    vendorDest = 'dist/assets/js/*.js',
    scriptSrc = 'src/assets/js/*.js',
    scriptDest = 'dist/assets/js/*.js',
    imageSrc = 'src/assets/img/**/*';


// move tailwind css to scss folders
function tailwind() {
    return gulp
        .src('tailwind.import.css')
        .pipe(postcss([tailwindcss('tailwind.js'), require('autoprefixer')]))
        .pipe(rename('_tailwind.scss'))
        .pipe(gulp.dest('src/assets/scss/vendors/'));
}

// conver and move scss to css
function scss() {
    return gulp.src('src/assets/scss/app.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(styleDest))
        .pipe(browserSync.stream());
}

// minify css
function minifyCSS() {
    return gulp.src('src/assets/scss/app.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(cleanCSS({
            compatibility: 'ie8'
        }))
        .pipe(gulp.dest(styleDest));
}

// move Html to dist
function moveHtml() {
    return gulp.src('src/*.html')
        .pipe(gulp.dest('dist/'));
}

// Optimize Images
function images() {
    return gulp
        .src(imageSrc)
        .pipe(newer("dist/assets/img"))
        .pipe(
            imagemin([
                imagemin.gifsicle({
                    interlaced: true
                }),
                imagemin.jpegtran({
                    progressive: true
                }),
                imagemin.optipng({
                    optimizationLevel: 5
                }),
                imagemin.svgo({
                    plugins: [{
                        removeViewBox: false,
                        collapseGroups: true
                    }]
                })
            ])
        )
        .pipe(gulp.dest("dist/assets/img"));
}

// Uglify js files
function scripts() {
    return gulp.src('src/assets/js/*.js')
        .pipe(plumber())
        .pipe(uglify())
        .pipe(gulp.dest('dist/assets/js'));
};

//Concat and Compress Vendor .js files
function vendors() {
    return gulp.src([
            'src/assets/js/vendors/jquery.min.js',
            'src/assets/js/vendors/*.js'
        ])
        .pipe(plumber())
        .pipe(concat('vendors.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/assets/js'));
};

//delete all dist assets
function clean() {
    return del([
        'dist/assets/',
    ]);
}

// watch
function watch() {
    browserSync.init({
        server: {
            baseDir: "./dist"
        },
        notify: false
    });

    gulp.watch(styleSrc, scss);
    gulp.watch(scriptSrc, scripts);
    gulp.watch(vendorSrc, vendors);
    gulp.watch(imageSrc, images);
    gulp.watch(htmlSrc, moveHtml)
    gulp.watch([htmlDest, styleDest, scriptDest, vendorDest]).on('change', browserSync.reload);
}

const build = gulp.series(clean, gulp.parallel(minifyCSS, scripts, vendors, images));

exports.tailwind = tailwind;
exports.scss = scss;
exports.minifyCSS = minifyCSS;
exports.moveHtml = moveHtml;
exports.vendors = vendors;
exports.scripts = scripts;
exports.images = images;
exports.clean = clean;
exports.watch = watch;
exports.default = build;