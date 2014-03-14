var fs = require('fs');
var express = require('express');
var mustache = require('mustache');
var app = express();

var PORT = process.env.PORT || 3000;
var DEBUG = 'DEBUG' in process.env;
var STATIC_DIR = __dirname + '/static';
var TAG_RE = /^([A-Za-z0-9_\-]+)$/;

var templateCache = {};

function loadTemplate(name) {
  var template = fs.readFileSync(STATIC_DIR + '/' + name, 'utf-8');
  mustache.parse(template);
  return template;
}

function renderTemplate(name, ctx) {
  if (!(name in templateCache) || DEBUG)
    templateCache[name] = loadTemplate(name);
  return mustache.render(templateCache[name], ctx);
}

app.use(express.static(STATIC_DIR));

app.get('/t/:tag', function(req, res, next) {
  if (!TAG_RE.test(req.params.tag)) return next();
  return res.send(renderTemplate('tag-based-minicade.html', {
    tag: req.params.tag
  }));
});

app.listen(PORT, function() {
  console.log('Listening on port', PORT);
});
