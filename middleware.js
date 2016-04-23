var querystring = require('querystring');
var mongo = require('autoredis').mongo;
var cache = require('autoredis').cache;
var common = require('common').common;

var Secret = require('common').secret;
var secret = new Secret();

exports = module.exports;

exports.cookieParse = function(req, res, next) {

	req.cookies = function(key) {
		var cookie = querystring.parse(req.headers.cookie, '; ');
		var result = cookie[key];
		return result ? result : null;
	}

	req.cookiesSafe = function(key) {
		var value = req.cookies(key);
		return value ? secret.Unsign(value) : "";
	}

	res.setCookies = function(key, value, timeout) {
		timeout = timeout && timeout > 0 ? timeout : 0;
		var options = {
			httpOnly: true,
			path: '/'
		};
		if (value != null && value != undefined) {
			if (timeout > 0) {
				timeout += 28800000;
				options.maxAge = timeout;
			}
			res.cookie(key, value, options);
		} else {
			res.clearCookie(key, options);
		}
	}

	res.setCookiesSafe = function(key, value, timeout) {
		value = value ? secret.Sign(value) : "";
		res.setCookies(key, value, timeout);
	}

	next();
}

exports.accessToken = function(req, res, next) {
	var token = req.query.access_token;
	var hash = common.hash(token);
	cache.get(hash)
		.then(function(value) {
			if (value === "OK") {
				next();
			} else {
				res.status(403).send('access token is rejected')
			}
		}, function() {
			res.status(403).send('access token is rejected')
		})
}

exports.watchTimeout = function(req, res, next) {
	var count = 0;
	var exec_start_at = Date.now();

	var writeToMongo = function(uri, time) {
		var table = 'apirecord';
		var now = new Date();
		var hour = now.getHours();
		var minute = now.getMinutes() + hour * 60;
		now = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		var hourly = "hourly." + hour;
		var min = "minute." + minute;
		var getMaxMin = function(obj) {
			var result = {};
			if (!obj.max || (obj.max && time > obj.max)) {
				result.max = time;
			}
			if (!obj.min || (obj.min && time < obj.min)) {
				result.min = time;
			}
			return result;
		}

		var query = {
			url: uri,
			date: now.getTime()
		};

		var info = {
			set: {
				url: uri,
				date: now.getTime()
			},
			inc: {
				'daily.n': 1,
				'daily.t': time
			}
		}
		info.inc["hourly." + hour + ".n"] = 1;
		info.inc["hourly." + hour + ".t"] = time;
		info.inc["minute." + minute + ".n"] = 1;
		info.inc["minute." + minute + ".t"] = time;

		mongo.where(table, query)
			.then(function(r) {
				r.toArray(function(err, r) {
					var item = r && r.length > 0 ? r[0] : {};

					var temp = null;
					//判断当天最大和最小值
					if (item.daily) {
						temp = getMaxMin(item.daily)
						if (temp.max) info.set['daily.max'] = temp.max;
						if (temp.min) info.set['daily.min'] = temp.min;
					} else {
						info.set['daily.max'] = time;
						info.set['daily.min'] = time;
					}
					//判断当天当前小时的最大和最小值
					if (item.hourly) {
						var h = item.hourly[hour.toString()] || {};
						temp = getMaxMin(h)
						if (temp.max) info.set['hourly.' + hour + '.max'] = temp.max;
						if (temp.min) info.set['hourly.' + hour + '.min'] = temp.min;
					} else {
						info.set['hourly.' + hour + '.max'] = time;
						info.set['hourly.' + hour + '.min'] = time;
					}
					//判断当天当前分钟的最大和最小值
					if (item.minute) {
						var m = item.minute[minute.toString()] || {};
						temp = getMaxMin(m)
						if (temp.max) info.set['minute.' + minute + '.max'] = temp.max;
						if (temp.min) info.set['minute.' + minute + '.min'] = temp.min;
					} else {
						info.set['minute.' + minute + '.max'] = time;
						info.set['minute.' + minute + '.min'] = time;
					}

					//保存数据
					mongo.collections(table)
						.then(function(list) {
							list.findOneAndUpdate(query, {
									$set: info.set,
									$inc: info.inc
								}, {
									returnOriginal: false,
									upsert: true,
									maxTimeMS: 100
								})
								.then(function(r) {
									mongo.close();
									//console.log(r)
								})
						})
				})
			})
	}

	var record = function() {
		if (count == 0) {
			count += 1;
			var process_time = Date.now() - exec_start_at;
			try {
				if (!global.config.debug) {
					var url = req.originalUrl;
					url = url.indexOf('?') >= 0 ? url.split('?')[0] : url;
					writeToMongo(url, process_time)
				}
			} catch (e) {
				console.info(e.stack)
			}
		}
	}
	var _send = res.send;
	res.send = function() {
		record();
		return _send.apply(res, arguments);
	};
	var _json = res.json;
	res.json = function() {
		record();
		return _json.apply(res, arguments);
	};

	next();
}