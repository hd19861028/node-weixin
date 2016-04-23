var express = require('express');
var querystring = require('querystring');
var common = require('wx-common').common;
var ws = require('wx-common').weixin;

var wxapi = express();

exports = module.exports;

wxapi.get('/common/jsapi_ticket', function(req, res) {
	var path = req.query.path;
	path = decodeURIComponent(path);

	ws.get_jsapi_ticket(path)
		.then(function(ticket) {
			res.json(ticket);
		}, function(err) {
			console.error(err)
			res.json(err);
		}).catch(function(error) {
			if (error) {
				console.error(error)
				res.json(error);
			}
		});
});

wxapi.get('/common/access_token', function(req, res) {

	ws.get_access_token()
		.then(function(token) {
			res.json({
				token: token
			});
		}, function(err) {
			console.error(err)
			res.json(err);
		})
		.catch(function(error) {
			if (error) {
				console.error(error)
				res.json(error);
			}
		});
});

exports.common = wxapi;