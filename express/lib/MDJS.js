var http = require('http');

var Fn = {
	/*
	/*  对象处理
	 */
	obj: {
		isEmptyObject: function(obj) { 
			for (var name in obj) { return false; }
			return true;
		}
	},
	/*
	/*  数据请求
	 */
	http: {
		get: function (url, success, error) {
			http.get(url, function (res) {
				var size = 0;
				var chunks = [];
				res.on('data', function (data) {	// 监听数据
					size += data.length;
					chunks.push(data);
				});
				res.on('end', function () {			// 数据监听结束
					var data = Buffer.concat(chunks, size).toString();
					// 如果数据为500则返回 空string
					data = isNaN(data-0)? JSON.parse(data): '';
					if (typeof(success) === 'function') success(data);
				});
			}).on('error', function (err) {			// 错误监听(404)
				if (typeof(error) === 'function') error(err);
				//console.log("Got error: " + err.message);
			});
		},
		post: function () {
			
		}
	},
	/*
	/*  错误处理
	 */
	error: {
		// 404 catch-all 处理器（中间件）
		'404': function (res) {
			res.status(404).render('404');
		},
		// 500 错误处理器（中间件）
		'500': function (res) {
			res.status(500).render('500');
		}
	}
};

exports.MDJS = Fn;