var fs = require('fs');

var yamlcade = require('./yamlcade');

var starterTemplate;

function getStarterTemplate(forceReload) {
  if (!starterTemplate || forceReload)
    starterTemplate = fs.readFileSync(
      __dirname + '/../static/starter-minicade.yaml',
      'utf-8'
    );
  return starterTemplate;
}

function MemStorage() {
  var cache = {};

  return {
    get: function(key, cb) {
      process.nextTick(function() {
        if (!(key in cache)) return cb(null, null);
        cb(null, cache[key]);
      });
    },
    set: function(key, content, cb) {
      process.nextTick(function() {
        cache[key] = content;
        cb(null);
      });
    }
  };
}

module.exports = function(options) {
  var storage = MemStorage();

  return {
    get: function(name, cb) {
      storage.get(name, function(err, yaml) {
        var isNew = false;

        if (err) return cb(err);
        if (!yaml) {
          yaml = getStarterTemplate(options.debug);
          isNew = true;
        }

        minicade = yamlcade.parse(yaml);
        minicade.isNew = isNew;
        cb(null, yaml, minicade);
      });
    },
    update: function(name, yaml, cb) {
      try {
        yamlcade.parse(yaml);
      } catch (e) {
        return process.nextTick(function() { cb(e); });
      }
      storage.set(name, yaml, cb);
    }
  }
};
