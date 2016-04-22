"use strict";

// 读取配置
require('./load_config');

// 配置路由
var router = require('./router');

if (global.config.cluster) {
	// 启动服务
	var cluster = require('cluster');

	if (cluster.isMaster) {
		var numCPUs = require('os').cpus().length;
		//正常启动
		router.start();

		for (var i = 0; i < numCPUs; i++) {
			cluster.fork();
		}

		cluster.on('listening', function(worker, address) {
			var dateTimeStr = new Date().toLocaleString();
			console.log('多线程启动： 进程id=' + worker.process.pid + '，端口号=' + address.port + "，时间=" + dateTimeStr);
		});
	} else {
		router.start_paraller(cluster.worker.id, cluster.worker.process.pid);
	}
} else {
	router.start();
	router.start_paraller();

	require('./timer/task')
}