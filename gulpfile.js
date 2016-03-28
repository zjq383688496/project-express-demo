/*
/* 引入模块
 */

/* gulp核心 */
var gulp = require('gulp');
/* html */
var minifyHTML = require('gulp-minify-html');	// html压缩
/* css */
var less    = require('gulp-less');				// less编译
var cssmin  = require('gulp-minify-css');		// css压缩
var csslint = require('gulp-csslint');			// css检测
/* js */
var coffee  = require('gulp-coffee');			// coffee-script编译
var babel   = require('gulp-babel');			// ES2015(ES6)编译
var uglify  = require('gulp-uglify');			// js混淆
var jshint  = require('gulp-jshint');			// js检测
var stylish = require('jshint-stylish');		// 高亮显示
/* img */
var imagemin = require('gulp-imagemin');		// 图片压缩
/* 文件操作 */
var concat     = require('gulp-concat');		// 文件合并
var clean      = require('gulp-clean');			// 文件清除
var sourcemaps = require('gulp-sourcemaps');	// sourcemaps生成
var rename     = require('gulp-rename');		// 文件重命名
/* 版本号控制 */
var rev          = require('gulp-rev');
var revCollector = require('gulp-rev-collector');
/* 监听 */
var plumber     = require('gulp-plumber');		// 监听异常
var notify      = require('gulp-notify');		// 异常提示
var runSequence = require('gulp-sequence');		// 执行队列
/* 工程相关配置 */
var gulpif     = require('gulp-if');			// if判断
var gulpConfig = require("./gulp_config");
var config     = new gulpConfig('beta');
var flag       = config.flag;
/* server */
var nodemon    = require('gulp-nodemon');		// 自动启动express服务
var livereload = require('gulp-livereload');	// 自动刷新

/*
/* 工作流
 */

/* 1. 清除文件 */

gulp.task('clean', function () {
	return gulp.src(config.cleanSrc)
	.pipe(clean());
});


/* 2. 编译 (beta环境会生成map) */
// 编译 less
gulp.task('less', function () {
	return gulp.src(config.lessSrc)
		.pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
		.pipe(gulpif(!flag, sourcemaps.init({loadMaps: true})))
		.pipe(less())
		.pipe(gulpif(!flag, sourcemaps.write('/')))
		.pipe(gulp.dest(config.cssDest))
		//.pipe(gulpif(!flag, livereload()));
});
// 编译 ES2015(ES6)
gulp.task('ES2015', function () {
	return gulp.src(config.ES6Src)
		.pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
		.pipe(gulpif(!flag, sourcemaps.init({loadMaps: true})))
		.pipe(babel({ presets: ['es2015'] }))
		.pipe(gulpif(!flag, sourcemaps.write('/')))
		.pipe(gulp.dest(config.jsDest))
		//.pipe(gulpif(!flag, livereload()));
});
// 编译 coffee-script
gulp.task('coffee', function () {
	return gulp.src(config.coffeeSrc)
		.pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
		.pipe(gulpif(!flag, sourcemaps.init({loadMaps: true})))
		.pipe(coffee())
		.pipe(gulpif(!flag, sourcemaps.write('/')))
		.pipe(gulp.dest(config.jsDest));
});


/* 3. 检测 OK */

// CSS 检测
gulp.task('csslint', function() {
	return gulp.src(config.cssSrc)
		.pipe(csslint());
		//.pipe(csslint.reporter())
		//.pipe(csslint.failReporter());
});
// jsS 检测
gulp.task('jslint', function() {
	return gulp.src(config.jsSrc)
		.pipe(jshint());
});


/* 4. 压缩 */
// css 压缩 (prd环境会压缩代码)
gulp.task('cssmin', function () {
	// prd: 压缩代码
	return gulp.src(config.cssSrc)
		.pipe(clean())
		.pipe(gulpif(flag, cssmin()))
		.pipe(rev())
		.pipe(gulp.dest(config.defPath))
		.pipe(rev.manifest())
		.pipe(gulp.dest(config.revCssDesc));
});
// js 压缩 (prd环境会压缩代码)
gulp.task('uglify', function () {
	// prd: 压缩代码
	return gulp.src(config.jsSrc)
		.pipe(clean())
		.pipe(gulpif(flag, uglify()))
		.pipe(rev())
		.pipe(gulp.dest(config.defPath))
		.pipe(rev.manifest())
		.pipe(gulp.dest(config.revJsDesc))
		//.pipe(gulpif(!flag, livereload()));
});
// images 压缩
gulp.task('imagemin', function () {
	return gulp.src(config.oldImgSrc)
		//.pipe(gulp.dest(config.imgDest))
		//.pipe(gulpif(flag, imagemin()))
		.pipe(rev())
		.pipe(gulp.dest(config.imgDest))
		.pipe(rev.manifest())
		.pipe(gulp.dest(config.revImgDesc))
		//.pipe(gulpif(!flag, livereload()));
});


/* 5. html压缩添加版本号 */
// css js 版本
gulp.task('revCss', function () {
	return gulp.src(config.revCssSrc)
		.pipe(revCollector())
		.pipe(gulp.dest(config.defPath));
});
gulp.task('revJs', function () {
	return gulp.src(config.revJsSrc)
		.pipe(revCollector())
		.pipe(gulp.dest(config.defPath));
});
gulp.task('revHbs', function () {
	if (flag) {
		return gulp.src(config.revHbsSrc)
			.pipe(revCollector())
			.pipe(rename({ extname: '.html' }))
			.pipe(minifyHTML({
				empty: true,
				spare: true
			}))
			.pipe(rename({ extname: '.hbs' }))
			.pipe(gulp.dest(config.viewDesc))
			//.pipe(gulpif(!flag, livereload()));
	} else {
		return gulp.src(config.revHbsSrc)
			.pipe(revCollector())
			.pipe(gulp.dest(config.viewDesc))
			//.pipe(gulpif(!flag, livereload()));
	}
});


/* 6. 清除版本号文件 */
gulp.task('cleanRev', function () {
	return gulp.src(config.revSrc)
		.pipe(clean());
});


/* 7. server */
gulp.task('serve', function () {
	nodemon({ script: 'md_cluster.js' });
});

/* 8. 监听 */
gulp.task('watch', function() {
	livereload.listen();
	gulp.watch(config.watchSrc, function () {
		console.log('reload');
		return runSequence(
			['less', 'ES2015', 'coffee'],
			['csslint', 'jslint'],
			['cssmin', 'uglify', 'imagemin'],
			['revCss', 'revJs'],
			'revHbs',
			'cleanRev'
		)();
	});
});



/* 执行顺序 */
// 1. 清空文件夹
// 2. 编译
// 3. 检测
// 4. 压缩
// 5. img/css/js 版本号处理
// 6. 启动服务

/* 生产环境 */
gulp.task('prd', function () {
	config = new gulpConfig('prd');
	flag   = config.flag;
	return runSequence(
		'clean',
		['less', 'ES2015', 'coffee'],
		['csslint', 'jslint'],
		['cssmin', 'uglify', 'imagemin'],
		['revCss', 'revJs'],
		'revHbs',
		'cleanRev',
		'serve'
	)();
});
/* 默认开发(测试)环境 */
gulp.task('default', function () {
	return runSequence(
		'clean',
		['less', 'ES2015', 'coffee'],
		['csslint', 'jslint'],
		['cssmin', 'uglify', 'imagemin'],
		['revCss', 'revJs'],
		'revHbs',
		'cleanRev',
		'serve'
	)();
});