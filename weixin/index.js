"use strict";
var express = require('express');
var app = express();
var crypto = require("crypto");
var common = require("wx-common").common;
var weixin = require('wx-common').weixin;
var request = require('wx-common').request;
var q = require('q');
var db = require('wx-common').db;

exports = module.exports;

app.post('*', function(req, res) {
	var result = "";
	req.on('data', function(chunk) {
		result += chunk.toString();
	});
	req.on('end', function() {
		//console.log("----------------原xml-------------------")
		
		common.xmlToJson(result, function(json) {
			var reply = weixin.process_msg(json, res);
			if (json.Event == "unsubscribe") {
				
			} else {
				res.type(".xml");
				res.send(reply);
			}
		})
	});
});

app.get('*', function(req, res) {
	var config = global.config.website;
	var webbase = "wx";
	var web = 'http://' + config.domain + '/index.html';
	var end = 'http://' + config.domain + '/end.html';

	var check_code = function() {
		var d = q.defer();
		if (req.query && req.query.code) {
			d.resolve(true);
		} else {
			d.resolve(false);
		}
		return d.promise;
	}
	var valid_token = function() {
		var result = weixin.validateToken(req.query);
		res.end(result);
	}
	var weixin_check = function() {
		var d = q.defer();
		var openid = res.locals.openid
		if (openid) {
			d.resolve(openid);
		} else {
			var code = req.query.code;
			var appid = config.appid;
			var secret = config.secret;
			var url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" + appid + "&secret=" + secret + "&code=" + code + "&grant_type=authorization_code";
			request.send(url, {})
				.then(function(msg) {
					if (msg && msg.openid) {
						d.resolve(msg.openid);
					} else {
						d.resolve(null);
					}
				}, function(err) {

				})
		}
		return d.promise;
	}
	var process_openid = function(openid) {
		res.setCookiesSafe(global.ckey.openid, openid, config.openid_expire);

	}

	check_code()
		.then(function(data) {
			if (data) {
				return weixin_check();
			} else {
				valid_token();
			}
		})
		.then(function(msg) {
			if (msg) {
				return process_openid(msg);
			}
		})
		.catch(function(error) {
			res.status(500).send(error);
		});
});

exports.api = app;