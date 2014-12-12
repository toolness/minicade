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

module.exports = function(options) {
  options = options || {};

  var storage = options.storage;

  if (!storage) storage = MemStorage();

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
    },
    findUnique: function(candidateGenerator, cb) {
      var candidate = candidateGenerator();
      storage.get(candidate, function(err, yaml) {
        if (err) return cb(err);
        if (yaml !== null)
          return this.findUnique(candidateGenerator, cb);
        cb(null, candidate);
      }.bind(this));
    }
  }
};
