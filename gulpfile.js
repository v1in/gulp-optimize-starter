"use strict";

var path = {
    build: {
        html: "assets/build/",
        js: "assets/build/js/",
        css: "assets/build/css/",
        img: "assets/build/img/",
        svg: "assets/build/img/",
        fonts: "assets/build/fonts/",
    },
    src: {
        html: "assets/src/*.html",
        js: "assets/src/js/*.js",
        scss: "assets/src/scss/main.scss",
        img: "assets/src/img/**/*.{png,jpg,jpeg}",
        svg: "assets/src/img/**/*.{svg,ico}",
        fonts: "assets/src/fonts/**/*.*",
    },
    watch: {
        html: "assets/src/**/*.html",
        js: "assets/src/js/**/*.js",
        scss: "assets/src/scss/**/*.scss",
        img: "assets/src/img/**/*.{png,jpg,jpeg}",
        svg: "assets/src/img/**/*.{svg,ico}",
        fonts: "assets/srs/fonts/**/*.*",
    },
    clean: "./assets/build/*",
};

// port
var config = {
    port: 1010,
    server: {
        baseDir: "./assets/build",
    },
    notify: false,
};

var gulp = require("gulp"),
    webserver = require("browser-sync"),
    plumber = require("gulp-plumber"),
    rigger = require("gulp-rigger"),
    sourcemaps = require("gulp-sourcemaps"),
    sass = require("gulp-sass")(require('sass')),
    postcss = require("gulp-postcss"),
    autoprefixer = require("autoprefixer"),
    gulpStylelint = require("gulp-stylelint"),
    cssnano = require("cssnano"),
    uglify = require("gulp-uglify-es").default,
    cache = require("gulp-cache"),
    imagemin = require("gulp-imagemin"),
    jpegrecompress = require("imagemin-jpeg-recompress"),
    pngquant = require("imagemin-pngquant"),
    rimraf = require("gulp-rimraf"),
    rename = require("gulp-rename"),
    size = require("gulp-size"),
    mode = require("gulp-mode")({
        modes: ["production", "development"],
        default: "development",
        verbose: false,
    }),
    color = require("chalk"),
    hash = require("gulp-hash"),
    references = require("gulp-hash-references");

// webserver
gulp.task("webserver", function () {
    webserver(config);
});

// html
gulp.task("html:build", function () {
    return gulp
        .src(path.src.html)
        .pipe(plumber())
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(webserver.reload({ stream: true }));
});

// styles
gulp.task("css:build", function () {
    return gulp
        .src(path.src.scss)
        .pipe(
            gulpStylelint({
                reporters: [{ formatter: "string", console: true }],
            })
        )
        .pipe(plumber())
        .pipe(mode.development(sourcemaps.init()))
        .pipe(sass())
        .pipe(postcss([autoprefixer()]))
        .pipe(gulp.dest(path.build.css))
        .pipe(rename({ suffix: ".min" }))
        .pipe(postcss([cssnano]))
        .pipe(mode.development(sourcemaps.write("./")))
        .pipe(mode.production(hash()))
        .pipe(gulp.dest(path.build.css))
        .pipe(mode.production(hash.manifest("assets.json")))
        .pipe(mode.production(gulp.dest("./assets/build/")))
        .pipe(webserver.reload({ stream: true }));
});

// js
gulp.task("js:build", function () {
    return gulp
        .src(path.src.js)
        .pipe(plumber())
        .pipe(rigger())
        .pipe(gulp.dest(path.build.js))
        .pipe(rename({ suffix: ".min" }))
        .pipe(mode.development(sourcemaps.init()))
        .pipe(uglify())
        .pipe(mode.production(hash()))
        .pipe(gulp.dest(path.build.js))
        .pipe(mode.production(hash.manifest("assets.json")))
        .pipe(mode.production(gulp.dest("./assets/build/")))
        .pipe(webserver.reload({ stream: true }));
});

//transformPath
gulp.task("update-references", function () {
    return gulp
        .src("./assets/build/**/*.html")
        .pipe(references("./assets/build/assets.json"))
        .pipe(gulp.dest("./assets/build/"));
});

// fonts
gulp.task("fonts:build", function () {
    return gulp.src(path.src.fonts).pipe(gulp.dest(path.build.fonts));
});

// svg (and favicon)
gulp.task("image-svg:build", function () {
    return gulp.src(path.src.svg).pipe(gulp.dest(path.build.svg));
});

// img
gulp.task("image:build", function () {
    return gulp
        .src(path.src.img)
        .pipe(
            cache(
                imagemin([
                    imagemin.gifsicle({ interlaced: true }),
                    jpegrecompress({
                        progressive: true,
                        max: 90,
                        min: 80,
                    }),
                    pngquant(),
                    imagemin.svgo({ plugins: [{ removeViewBox: false }] }),
                ])
            )
        )
        .pipe(gulp.dest(path.build.img));
});

// del build
gulp.task("del:build", function () {
    return gulp.src(path.clean, { read: false }).pipe(rimraf());
});

// clear cache
gulp.task("cache:clear", function () {
    return cache.clearAll();
});

// size
var blue = color.bgCyan.gray.bold;
var green = color.bgGreen.gray.bold;
var black = color.gray.bold;
var space = black(".....size ");

gulp.task("html-size", function () {
    console.log(space, blue("[HTML]"));
    return gulp.src("./assets/build/**/*.html").pipe(size({ showFiles: true }));
});

gulp.task("css-size", function () {
    console.log(space, blue("[CSS]"));
    return gulp.src("./assets/build/css/*").pipe(size({ showFiles: true }));
});

gulp.task("js-size", function () {
    console.log(space, blue("[JS]"));
    return gulp.src("./assets/build/js/*").pipe(size({ showFiles: true }));
});

gulp.task("img-size", function () {
    console.log(space, blue("[IMAGES]"));
    return gulp.src("./assets/build/img/**").pipe(size({ showFiles: true }));
});

gulp.task("fonts-size", function () {
    console.log(space, blue("[FONTS]"));
    return gulp.src("./assets/build/fonts/**").pipe(size({ showFiles: true }));
});

gulp.task("build-size", function () {
    console.log(green(" Public Files "));
    return gulp.src("./assets/build/**/*").pipe(size({ showFiles: false, title: "build/" }));
});

gulp.task("size", gulp.series("html-size", "css-size", "js-size", "fonts-size", "img-size", "build-size"));

// build
gulp.task(
    "build",
    gulp.series(
        "del:build",
        gulp.parallel("html:build", "css:build", "js:build", "fonts:build", "image-svg:build", "image:build")
    )
);

// watch
gulp.task("watch", function () {
    gulp.watch(path.watch.html, gulp.series("html:build"));
    gulp.watch(path.watch.scss, gulp.series("css:build"));
    gulp.watch(path.watch.js, gulp.series("js:build"));
    gulp.watch(path.watch.img, gulp.series("image-svg:build"));
    gulp.watch(path.watch.img, gulp.series("image:build"));
    gulp.watch(path.watch.fonts, gulp.series("fonts:build"));
});

// default
gulp.task("default", gulp.series("build", "size", gulp.parallel("webserver", "watch")));

// production
gulp.task("prod", gulp.series("build", "size", "update-references"));
