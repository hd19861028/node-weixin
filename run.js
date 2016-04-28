var exec = require('child_process').exec;
var fs = require('fs');

var tasklist = [
	'svn co https://172.16.3.160/svn/YXT/Code/WeiXin/wx --username hjd --password 123456',
	'grunt manifest',
	'node r.js -o r-build.json'
]

var taskdesc = [
	'从svn获取代码',
	'执行grunt编译',
	'执行require依赖编译，时间较长，耐心等待！'
]

function run(name) {
	var d = Promise.defer();
	exec(name, function(error, stdout, stderr) {
		d.resolve({
			error: error, 
			out: stdout
		})
	});
	return d.promise;
}

fs.writeFileSync('log/error.log', '')
fs.writeFileSync('log/info.log', '')

function Finally(msg, iserror){
	var log = 'log/info.log';
	if(iserror == true){
		log = 'log/error.log';
		console.error(msg)
	}
	fs.appendFileSync(log, msg)
	isrun = false;
	console.timeEnd('执行时间')
}

var isrun = false;
var timer = setInterval(function() {
	if (isrun === false) {
		isrun = true;
		if (tasklist.length > 0) {
			var task = tasklist.shift();
			var desc = taskdesc.shift();
			console.log(desc)
			console.time('执行时间')
			run(task)
				.then(function(data) {
					var issuccess = true;
					if(data.error){
						tasklist = [];
						issuccess = false;
					}
					Finally(data.out, !issuccess)
				})
		} else {
			clearInterval(timer)
		}
	}
}, 100)
