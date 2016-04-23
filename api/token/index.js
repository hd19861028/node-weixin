"use strict";
var express = require('express');
var qs = require('querystring');
var mongo = require('autoredis').mongo;
var cache = require('autoredis').cache;
var secret = require('wx-common').secret;
var common = require('wx-common').common;

var app = express();

exports = module.exports;

app.get("/token/get", function(req, res) {
	var pub = req.query.public;
	var pri = req.query.private;
	var data = {};
	mongo.collections('token')
		.then(function(list) {
			list.find({
				public: pub,
				private: pri
			}).toArray(function(err, r) {
				if (err || (r && r.length == 0)) {
					data.status = false;
					data.code = 403;
					data.message = "You have no permission to get access_token!";
				} else {
					var sec = new secret();
					var timespan = Date.now();
					var access_token = sec.ASE_Encrypt(pub + timespan, pri + timespan);
					var hash = common.hash(access_token);
					data.status = true;
					data.code = 200;
					data.expire = 7200;
					data.access_token = access_token;
					cache.set(hash, "OK", 7200);
				}
				mongo.close();
				res.json(data);
			})
		})
});

app.post("/token/save", function(req, res) {
	var result = "";
	var data = {};
	req.on('data', function(chunk) {
		result += chunk.toString();
	})
	req.on('end', function() {
		var body = qs.parse(result);
		if (body.public && body.private) {
			mongo.insert('token', body)
				.then(function(ids) {
					data.status = true;
					res.json(data);
				}, function(err) {
					data.status = false;
					data.code = 500;
					data.message = "Server Error!";
					res.json(data);
				})
		} else {
			data.status = false;
			data.code = 400;
			data.message = "The public key and the private key are require!";
			res.json(data);
		}
	})
});

exports.api = app;