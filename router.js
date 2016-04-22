"use strict";

var express = require('express');
var middleware = require('./middleware');
var weixin = express();
var tokenAPI = express();
var tokenDATA = express();

weixin.use(middleware.cookieParse);
tokenDATA.use(middleware.accessToken);

exports = module.exports;

weixin.all('*', function(req, res) {
	res.locals.openid = req.cookiesSafe(global.ckey.openid);

	req.next();
});

var ws = require('./weixin');
var wxapi = require('./wx');

weixin.use('/weixin', ws.api);
weixin.use('/wxapi', wxapi.common);

var token = require('./api/token');

tokenAPI.use('/api', token.api);

var login = require('./data/login');

tokenDATA.use('/data', login.data);

exports.start = function() {
	if (global.config.token_api_port && global.config.token_api_port > 0) {
		tokenAPI.listen(global.config.token_api_port);
	}
	if (global.config.token_data_port && global.config.token_data_port > 0) {
		tokenDATA.listen(global.config.token_data_port);
	}
}

exports.start_paraller = function(workid, processid) {
	global.config.cluster = {
		wid: workid,
		pid: processid
	}
	if (global.config.weixin_port && global.config.weixin_port > 0) {
		weixin.listen(global.config.weixin_port);
	}
}