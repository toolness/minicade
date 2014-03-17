var request = require('request');

var MAKE_API_URL = 'https://makeapi.webmaker.org/api/20130724';
var DEFAULT_LIMIT = 30;

function getMakesWithTag(tag, limit, cb) {
  if (typeof(limit) == 'function') {
    cb = limit;
    limit = DEFAULT_LIMIT;
  }
  request({
    url: MAKE_API_URL + '/make/search',
    qs: {tags: tag, limit: limit.toString()}
  }, function(err, res, body) {
    if (err) return cb(err);
    if (res.statusCode != 200)
      return cb(new Error('got status code ' + res.statusCode));

    cb(null, JSON.parse(body).makes);
  });
}

function doesTagExist(tag, cb) {
  getMakesWithTag(tag, 1, function(err, makes) {
    if (err) return cb(err);
    cb(null, !!makes.length);
  });
}

function findUniqueTag(candidateGenerator, cb) {
  var candidate = candidateGenerator();
  doesTagExist(candidate, function(err, exists) {
    if (err) return cb(err);
    if (exists) return findUniqueTag(candidateGenerator, cb);
    cb(null, candidate);
  });  
}

exports.MAKE_API_URL = MAKE_API_URL;
exports.getMakesWithTag = getMakesWithTag;
exports.doesTagExist = doesTagExist;
exports.findUniqueTag = findUniqueTag;
