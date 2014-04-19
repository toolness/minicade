var nunjucks = require('nunjucks');
var highlightExtension = require('./render-highlighted-code').nunjucks;

// Nunjucks has a bug where its standard watch-for-updates algorithm
// doesn't recurse into subdirectories, so when debugging, we'll just
// recompile templates on every request.
function fullyReloadAllTemplates(loader) {
  return function(req, res, next) {
    Object.keys(loader.pathsToNames).forEach(function(fullname) {
      loader.emit('update', loader.pathsToNames[fullname]);
    });
    return next();
  };
}

exports.express = function(app, options) {
  var loader = new nunjucks.FileSystemLoader(options.rootDir, true);
  var nunjucksEnv = new nunjucks.Environment(loader, {autoescape: true});

  if (options.debug) app.use(fullyReloadAllTemplates(loader));
  highlightExtension.initialize(nunjucksEnv);
  nunjucksEnv.express(app);
};
