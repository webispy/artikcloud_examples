var https = require('https');
var url = require('url');
var proxyagent = require('https-proxy-agent');
var config = require('./config.json');

if (process.env.http_proxy)
	var agent = new proxyagent(process.env.http_proxy);

var sendMessage = function(device_id, device_token, message_data) {
	return new Promise((resolve, reject) => {
		var post_data = JSON.stringify({
			'sdid': device_id,
			'type': 'message',
			'data': message_data
		});

		var opts = url.parse('https://api.artik.cloud/v1.1/messages');
		opts.method = 'POST';
		opts.agent = agent;
		opts.headers = {
			'Content-Type' : 'application/json',
			'Authorization' : 'Bearer ' + device_token,
		    'Content-Length' : post_data.length
		}

		var req = https.request(opts, (res) => {
			var tmp = [];
			res.on('data', (chunk) => tmp.push(chunk));
			res.on('end', () => {
				if (res.statusCode < 200 || res.statusCode > 299) {
					reject(new Error(JSON.parse(tmp.join('')).error.message + ' (status code: ' + res.statusCode + ')'));
				}
				resolve(JSON.parse(tmp.join('')))
			});
		}).on('error', (err) => reject(err));

		req.write(post_data);
		req.end();
	});
};

var getUserSelf = function(user_token) {
	return new Promise((resolve, reject) => {
		var opts = url.parse('https://api.artik.cloud/v1.1/users/self');
		opts.agent = agent;
		opts.headers = {
			'Content-Type' : 'application/json',
			'Authorization' : 'Bearer ' + user_token
		}

		https.get(opts, (res) => {
			var tmp = [];
			res.on('data', (chunk) => tmp.push(chunk));
			res.on('end', () => {
				if (res.statusCode < 200 || res.statusCode > 299) {
					reject(new Error(JSON.parse(tmp.join('')).error.message + ' (status code: ' + res.statusCode + ')'));
				}
				resolve(JSON.parse(tmp.join('')))
			});
		}).on('error', (err) => reject(err));
	});
};

var getUserDevices = function(user_token, user_id) {
	return new Promise((resolve, reject) => {
		var opts = url.parse('https://api.artik.cloud/v1.1/users/' + user_id + '/devices');
		opts.agent = agent;
		opts.headers = {
			'Content-Type' : 'application/json',
			'Authorization' : 'Bearer ' + user_token
		}

		https.get(opts, (res) => {
			var tmp = [];
			res.on('data', (chunk) => tmp.push(chunk));
			res.on('end', () => {
				if (res.statusCode < 200 || res.statusCode > 299) {
					reject(new Error(JSON.parse(tmp.join('')).error.message + ' (status code: ' + res.statusCode + ')'));
				}
				resolve(JSON.parse(tmp.join('')))
			});
		}).on('error', (err) => reject(err));
	});
};

var getDeviceInfo = function(did, token) {
	return new Promise((resolve, reject) => {
		var opts = url.parse('https://api.artik.cloud/v1.1/devices/' + did + '?properties=true');
		opts.agent = agent;
		opts.headers = {
			'Content-Type' : 'application/json',
			'Authorization' : 'Bearer ' + token
		};

		https.get(opts, (res) => {
			var tmp = [];
			res.on('data', (chunk) => tmp.push(chunk));
			res.on('end', () => {
				if (res.statusCode < 200 || res.statusCode > 299) {
					reject(new Error(JSON.parse(tmp.join('')).error.message + ' (status code: ' + res.statusCode + ')'));
				}
				resolve(JSON.parse(tmp.join('')))
			});
		}).on('error', (err) => reject(err));
	});
};

var getDeviceType = function(dtype, token) {
	return new Promise((resolve, reject) => {
		var opts = url.parse('https://api.artik.cloud/v1.1/devicetypes/' + dtype);
		opts.agent = agent;
		opts.headers = {
			'Content-Type' : 'application/json',
			'Authorization' : 'Bearer ' + token
		}

		https.get(opts, (res) => {
			var tmp = [];
			res.on('data', (chunk) => tmp.push(chunk));
			res.on('end', () => {
				if (res.statusCode < 200 || res.statusCode > 299) {
					reject(new Error(JSON.parse(tmp.join('')).error.message + ' (status code: ' + res.statusCode + ')'));
				}
				resolve(JSON.parse(tmp.join('')))
			});
		}).on('error', (err) => {
			reject(err);
		});
	});
};

if (1) {
	console.log('Test getUserSelf');
	getUserSelf(config.User_Token).then((result) => {
		console.log("getUserSelf:", JSON.stringify(result, null, 4));

		return getUserDevices(config.User_Token, result.data.id);
	}).then((result) => {
		console.log("getUserDevices:", JSON.stringify(result, null, 4));

		var list = [];
		for (var x in result.data.devices) {
			list.push(getDeviceType(result.data.devices[x].dtid, config.User_Token));
		}

		return Promise.all(list);
	}).then((result) => {
		console.log("getDeviceType:", JSON.stringify(result, null, 4));
	}).catch((err) => {
		console.error(err);
	});
}

if (0) {
	console.log('Test sendMessage');
	sendMessage(config.Device_ID_for_sendMessage, config.Device_Token_for_sendMessage, {
		value: 2345,
		switch: true
	}).then((result) => {
		console.log("sendMessage:", JSON.stringify(result, null, 4));
	}).catch((err) => {
		console.error(err);
	});
}


