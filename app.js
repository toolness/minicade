var express = require('express');
var tagging = require('./lib/tagging');
var makeapi = require('./lib/makeapi');

var PORT = process.env.PORT || 3000;
var DEBUG = 'DEBUG' in process.env;
var STATIC_DIR = __dirname + '/static';

var app = express();
var renderTemplate = require('./lib/render-template')({
  rootDir: STATIC_DIR,
  debug: DEBUG
});
var renderLess = require('./lib/render-less')({
  paths: [STATIC_DIR + '/css'],
  debug: DEBUG
});
var randomTagGenerator = require('./lib/random-tag-generator')({
  numWordLists: 2,
  wordListFormat: STATIC_DIR + '/word-lists/word-%d.txt',
  tagTemplate: '{{words.0}}-{{words.1}}-minijam-{{number}}',
  debug: DEBUG
});
var renderHighlightedCode = require('./lib/render-highlighted-code');

app.use(express.static(STATIC_DIR));

app.get('/css/base.css', renderLess('base.less'));

app.get('/new-tag', function(req, res, next) {
  makeapi.findUniqueTag(randomTagGenerator, function(err, tag) {
    if (err) return next(err);
    res.redirect('/t/' + tag);
  });
});

app.get('/t/:tag', function(req, res, next) {
  if (!tagging.isValidTag(req.params.tag)) return next();
  makeapi.getMakesWithTag(req.params.tag, function(err, makes) {
    if (err) return next(err);
    renderTemplate(res, 'tag-based-minicade.html', {
      tag: req.params.tag,
      makes: makes,
      makesJSON: JSON.stringify(makes),
      isPlayable: !!makes.length,
      highlight_js: renderHighlightedCode('js'),
      highlight_html: renderHighlightedCode('html')
    });
  });
});

app.listen(PORT, function() {
  console.log('Listening on port', PORT);
});
