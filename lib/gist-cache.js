var LRU = require('lru-cache');
var request = require('request');
var _ = require('underscore');

var BASE_URL = 'https://api.github.com';
var DEFAULT_SIZE = 1000000;

function CacheEntry(etag, body) {
  this.etag = etag;
  this.body = body;
}

function GistCache(options) {
  options = options || {};
  var self = this;
  var cache = LRU({
    max: options.size || DEFAULT_SIZE,
    length: function(n) { return n.body.length; },
    maxAge: options.maxAge || 1000 * 60 * 60
  });
  var baseQs = options.clientSecret ? {
    client_id: options.clientId,
    clientSecret: options.clientSecret
  } : {};
  var baseHeaders = {
    'User-Agent': options.userAgent || 'nodejs'
  };

  self.get = function get(id, cb) {
    var headers = _.extend(baseHeaders);
    var cached = cache.get(id);

    if (cached) headers['If-None-Match'] = cached.etag;

    request({
      url: BASE_URL + '/gists/' + id,
      qs: baseQs,
      headers: headers
    }, function(err, res, body) {
      if (err) return cb(err);

      switch (res.statusCode) {
        case 200:
        cached = new CacheEntry(res.headers['etag'], body);
        cache.set(id, cached);
        case 304:
        return cb(null, JSON.parse(cached.body));

        default:
        return cb(new Error('got http status ' + res.statusCode));
      }
    });
  };

  self.status = function status(cb) {
    request({
      url: BASE_URL + '/rate_limit',
      headers: baseHeaders,
      qs: baseQs
    }, function(err, res, body) {
      if (err) return cb(err);
      if (res.statusCode != 200)
        return cb(new Error('got http status ' + res.statusCode));
      cb(null, {
        cache: {
          length: cache.length,
          itemCount: cache.itemCount
        },
        rateLimit: JSON.parse(body)
      });
    });
  };

  return self;
}

module.exports = GistCache;
