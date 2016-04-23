"use strict";
var express = require('express');
var qs = require('querystring');
var mongo = require('autoredis').mongo;
var cache = require('autoredis').cache;
var secret = require('common').secret;

var app = express();

exports = module.exports;

app.get("/login/test", function(req, res) {
	res.send('有权限')
});


exports.data = app;