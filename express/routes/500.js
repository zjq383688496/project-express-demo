var express = require('express');
var router = express.Router();

/* 500 错误处理器（中间件） */
router.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500).render('500');
});

module.exports = router;