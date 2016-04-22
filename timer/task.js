var CronJob = require('cron').CronJob;
var fs = require('fs');
var path = require('path');
var cache = require('common').cache;

/**
 * Seconds: 0-59
 * Minutes: 0-59
 * Hours: 0-23
 * Day of Month: 1-31
 * Months: 0-11
 * Day of Week: 0-6
 */
var job = new CronJob({
	cronTime: '00 00 * * * *',
	onTick: function() {

	},
	start: true,
	timeZone: "Asia/Hong_Kong"
});