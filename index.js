var http = require('http');
var u = require('url');

module.exports = function(options) {
  initOptions(options);
  if (options.method === 'GET') {
    get(options);
  } else if (options.method === 'POST') {
    post(options);
  }
}

function initOptions(options) {
  var defaultOptions = {
    method: 'GET',
    callback: function() {},
    dataType: 'json'
  };
  Object.keys(defaultOptions).forEach(function(key) {
    if (typeof options[key] === 'undefined') {
      options[key] = defaultOptions[key];
    }
  });
  return options;
}

function getUrlObject(url, data) {
  url = u.parse(url, true);
  var location = window.location;
  var defaultUrl = {
    protocol: location.protocol || 'http:',
    slashes: true,
    hostname: location.hostname || 'localhost',
    port: location.port || 80,
    pathname: location.pathname || '/',
    query: {}
  };
  Object.keys(defaultUrl).forEach(function(key) {
    if (typeof url[key] === 'undefined' || url[key] === null) {
      url[key] = defaultUrl[key];
    }
  });
  if (typeof data === 'object') {
    Object.keys(data).forEach(function(key) {
      url.query[key] = data[key];
    });
  }
  // query will only be used if search is absent
  delete url.search;
  return url;
}

function get(options) {
  var url = u.format(getUrlObject(options.url, options.data));
  http.get(url, function(res) {
    var data = '';
    res.on('data', function(buf) {
      data += buf;
    })
    res.on('end', function() {
      switch (options.dataType) {
        case 'json': data = JSON.parse(data); break;
      }
      options.callback(null, data);
    })
  });
}

function post(options) {
  var urlObject = getUrlObject(options.url);
  urlObject.method = 'POST';
  var req = http.request(urlObject, function(res) {
    var data = '';
    res.on('data', function(buf) {
      data += buf;
    })
    res.on('end', function() {
      switch (options.dataType) {
        case 'json': data = JSON.parse(data); break;
      }
      options.callback(null, data);
    });
  });
  req.write(JSON.stringify(options.data) + '\n');
  req.end();
}