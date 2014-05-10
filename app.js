var express = require('express');
var tagging = require('./lib/tagging');
var makeapi = require('./lib/makeapi');
var template = require('./lib/template');

var PORT = process.env.PORT || 3000;
var DEBUG = 'DEBUG' in process.env;
var STATIC_DIR = __dirname + '/static';

var app = express();
var gistCache = require('./lib/gist-cache')();
var renderLess = require('./lib/render-less')({
  paths: [STATIC_DIR + '/css'],
  debug: DEBUG
});
var randomTagGenerator = require('./lib/random-tag-generator')({
  numWordLists: 2,
  wordListFormat: STATIC_DIR + '/word-lists/word-%d.txt',
  tagTemplate: '{{words[0]}}-{{words[1]}}-{{number}}',
  debug: DEBUG
});
var renderHighlightedCode = require('./lib/render-highlighted-code');

template.express(app, {
  rootDir: __dirname + '/template',
  debug: DEBUG
});

app.use(express.static(STATIC_DIR));

app.get('/css/base.css', renderLess('base.less'));

app.param('gistId', function(req, res, next, param) {
  if (!/^[0-9]+$/.test(param)) return next(404);

  gistCache.get(param, function(err, gist) {
    if (err) return next(err);
    if (!gist) return next(404);
    req.gist = gist;
    return next();
  });
});

app.get('/gist/:gistId', function(req, res, next) {
  // TODO: Parse gist YAML and render a minicade page for it, as per #6.
  return res.send(req.gist);
});

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
    res.render('tag-based-minicade.html', {
      tag: req.params.tag,
      makes: makes,
      makesJSON: JSON.stringify(makes),
      isPlayable: !!makes.length,
      highlight_js: renderHighlightedCode('js'),
      highlight_html: renderHighlightedCode('html'),
      GA_TRACKING_ID: process.env.GA_TRACKING_ID,
      GA_HOSTNAME: process.env.GA_HOSTNAME || 'minica.de'
    });
  });
});

app.use(function(err, req, res, next) {
  if (typeof(err) == 'number')
    return res.type('text/plain').send(err);
  if (typeof(err.status) == 'number')
    return res.type('text/plain').send(err.status, err.message);
  process.stderr.write(err.stack);
  res.type('text')
    .send(500, DEBUG ? err.stack : 'Sorry, something exploded!');
});

app.listen(PORT, function() {
  console.log('Listening on port', PORT);
});
