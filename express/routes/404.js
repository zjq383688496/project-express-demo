var express = require('express');
var router = express.Router();

/* 404 catch-all 处理器（中间件） */
router.use(function(req, res, next){
	res.status(404).render('404');
});

module.exports = router;