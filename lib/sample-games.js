var fs = require('fs');
var yaml = require('js-yaml');

var minicadeSchema = require('./minicade-schema');

var FILENAME = __dirname + '/../static/sample-games.yaml';

module.exports = function(options) {
  options = options || {};

  var debug = options.debug;
  var cached = null;
  var getCached = function() {
    if (debug || !cached) {
      cached = yaml.safeLoad(fs.readFileSync(FILENAME, 'utf-8'));
      cached.forEach(function(game) {
        game.authors = game.authors.split(' ');
      });
      cached.forEach(minicadeSchema.embellishGame);
    }
    return cached;
  };

  return {
    get: getCached,
    paginate: function(entriesPerPage) {
      var games = getCached();
      var pages = [];
      var totalPages = Math.ceil(games.length / entriesPerPage);

      for (var i = 0; i < totalPages; i++) {
        var base = i * entriesPerPage;
        pages.push(games.slice(base, base + entriesPerPage));
      }

      return pages;
    }
  };
};
