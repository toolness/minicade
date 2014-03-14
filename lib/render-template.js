var fs = require('fs');
var mustache = require('mustache');

module.exports = function(options) {
  var templateCache = {};

  function loadTemplate(name) {
    var template = fs.readFileSync(options.rootDir + '/' + name, 'utf-8');
    mustache.parse(template);
    return template;
  }

  return function renderTemplate(res, name, ctx) {
    if (!(name in templateCache) || options.debug)
      templateCache[name] = loadTemplate(name);
    res.send(mustache.render(templateCache[name], ctx));
  };
};
