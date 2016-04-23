"use strict";

var fi = require('wx-common').fileinfo;
var path = require('path');
var json = require("./config");

json.root = __dirname;

fi.Dir.ExistsAndCreateSync(path.join(json.root, 'log'));

global.config = json;
//cookie的key
global.ckey = {
	id: "id",
	memberid: "memberid",
	openid: "openid"
};

require('wx-common').prototype;