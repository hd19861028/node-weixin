"use strict";
var express = require('express');
var qs = require('querystring');
var mongo = require('common').mongo;
var cache = require('common').cache;
var secret = require('common').secret;

var app = express();

exports = module.exports;

app.get("/login/test", function(req, res) {
	res.send('有权限')
});


exports.data = app;