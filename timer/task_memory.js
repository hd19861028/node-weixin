var CronJob = require('cron').CronJob;
var exec = require('child_process').exec;
var email = require('common').email;
var util = require('util');

function shell(commond, cb) {
	exec(commond, function(error, stdout, stderr) {
		if (cb) cb(stdout)
	});
}

function clean(array) {
	var result = [];
	if (array) {
		for (var i = 0; i < array.length; i++) {
			if (array[i]) result.push(array[i])
		}
	}
	return result;
}

var options = {
	cronTime: '00 5/5 * * * *',
	onTick: function() {
		shell('free -m', function(out) {
			var a = out.split('\n');
			var cacheUsed = clean(a[2].split(' '));
			var swapUsed = clean(a[3].split(' '));
			var result = "";
			//内存使用情况
			var used = parseInt(cacheUsed[2]);
			var canUsed = parseInt(cacheUsed[3]);
			var total = used + canUsed;
			var useRate = (used * 100 / total).toFixed(2)
			result += util.format('总内存：%d，已使用：%d，使用率：%s%\n', total, used, useRate);

			//交换分区使用情况
			var swapTotal = parseInt(swapUsed[1]);
			var swapUsed = parseInt(swapUsed[2]);
			var swapRate = (swapUsed * 100 / swapTotal).toFixed(2)
			result += util.format('总交换分区：%d，已使用：%d，使用率：%s%', swapTotal, swapUsed, swapRate);

			if (swapRate > 30) {
				shell('echo 3 > /proc/sys/vm/drop_caches')
				shell('swapoff -a && swapon -a')
				email.send('内存警报', result)
			}
		})
	},
	start: false,
	timeZone: "Asia/Hong_Kong"
};

options.start = global.config.memory;

var job = new CronJob(options);

if (options.start) {
	console.log('内存监控已经开启...')
}