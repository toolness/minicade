var express = require('express');

var PORT = process.env.PORT || 3000;
var DEBUG = 'DEBUG' in process.env;
var STATIC_DIR = __dirname + '/static';
var TAG_RE = /^([A-Za-z0-9_\-]+)$/;

var app = express();
var renderTemplate = require('./lib/render-template')({
  rootDir: STATIC_DIR,
  debug: DEBUG
});
var renderLess = require('./lib/render-less')({
  paths: [STATIC_DIR + '/css'],
  debug: DEBUG
});

app.use(express.static(STATIC_DIR));

app.get('/css/base.css', renderLess('base.less'));

app.get('/t/:tag', function(req, res, next) {
  if (!TAG_RE.test(req.params.tag)) return next();
  renderTemplate(res, 'tag-based-minicade.html', {
    tag: req.params.tag
  });
});

app.listen(PORT, function() {
  console.log('Listening on port', PORT);
});
