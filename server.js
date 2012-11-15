var buckets = {
	users : {
		0 : {name: 'Bob', age: 30},
		1 : {name: 'Fred', age: 10}
	}
};

var nextIndices = {
	users : 2
};

function stringify(object) {
	return JSON.stringify(object, null, ' ') + '\n';
}

var server = require('http').createServer(function(request, response) {
	var url = request.url.replace(/^\/|\/$/g,"").split("/"),
	    urlIsRoot = (request.url == '/'),
	    urlIsCollection = (url.length == 1 && !urlIsRoot),
	    urlIsElement = (url.length == 2),
	    collectionExists = ((urlIsCollection || urlIsElement) && url[0] in buckets),
	    elementExists = (urlIsElement && url[0] in buckets && url[1] in buckets[url[0]]);

	if (url.length > 2) {
		response.end('Invalid URL - should be in the form /container or /container/id.\n');
	}

	else if (request.method == 'GET') {
		if (urlIsRoot) {
			var keys = {};
			keys['collections'] = [];
			for (var key in buckets) {
				keys['collections'].push('/' + key);
			}
			response.end(stringify(keys));
		} else if (urlIsCollection) {
			var keys = {};
			keys[url[0]] = [];
			for (var key in buckets[url[0]]) {
				keys[url[0]].push('/' + url[0] + '/' + key);
			}
			response.end(stringify(keys));
		} else {
			if (collectionExists) {
				if (elementExists) {
					response.end(stringify(buckets[url[0]][url[1]]));
				} else {
					response.end('No such element.\n');
				}
			} else {
				response.end('No such collection.\n');
			}
		}

	} else if (request.method == 'POST') {
		if (urlIsRoot) {
			response.end('Cannot POST into the root.\n');
		} else if (urlIsElement) {
			response.end('Cannot POST into an element.\n');
		} else {
			var data = '';
			request.on('data', function (chunk) {
				data += chunk;
			});
			request.on('end', function () {
				if (!collectionExists) {
					buckets[url[0]] = {};
					nextIndices[url[0]] = 0;
					collectionExists = true;
				}
				if (data == '') {
					response.end('No data.\n');
				} else {
					try {
						var newIdx = -1;
						do {
							newIdx = nextIndices[url[0]]++;
						} while (buckets[url[0]][newIdx]);
						buckets[url[0]][newIdx] = JSON.parse(data);
						response.end('/' + url[0] + '/' + newIdx + '\n');
					} catch (e) {
						response.end('Invalid JSON object: ' + e + '\n');
					}
				}
			});
		}

	} else if (request.method == 'PUT') {
		if (urlIsRoot) {
			response.end('Cannot PUT into the root.\n');
		} else if (urlIsCollection) {
			response.end('PUTting into a collection would replace the entire collection. ' + 
				'Maybe you could do that if it was desired behavior.\n');
		} else {
			var data = '';
			request.on('data', function (chunk) {
				data += chunk;
			});
			request.on('end', function () {
				if (!collectionExists) {
					buckets[url[0]] = {};
					nextIndices[url[0]] = 0;
					collectionExists = true;
				}
				if (data == '') {
					response.end('No data.\n');
				} else {
					try {
						buckets[url[0]][url[1]] = JSON.parse(data);
						response.end('/' + url[0] + '/' + url[1] + '\n');
					} catch (e) {
						response.end('Invalid JSON object: ' + e + '\n');
					}
				}
			});
		}

	} else if (request.method == 'DELETE') {
		if (urlIsRoot) {
			response.end('Cannot DELETE the root.\n');
		} else if (urlIsCollection) {
			response.end('Maybe you could DELETE an entire collection if it was desired behavior.\n');
		} else {
			if (url[0] in buckets && url[1] in buckets[url[0]]) {
				delete buckets[url[0]][url[1]];
				response.end('Deleted.\n');
			} else if (url[0] in buckets) {
				response.end('Object not found.\n');
			} else {
				response.end('No such collection.\n');
			}
		}
	} else {
		response.end('Unrecognized request method: ' + request.method + '\n');
	}
});

var port = process.argv[2] || 12357;
server.listen(port);
console.log('Listening on port ' + port);
