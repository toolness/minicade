var http = require('http');
var _ = require('underscore');
var WebSocketServer = require('ws').Server;
var MongoClient = require('mongodb').MongoClient;
var express = require('express');
var bodyParser = require('body-parser');
var tagging = require('./lib/tagging');
var yamlcade = require('./lib/yamlcade');
var makeapi = require('./lib/makeapi');
var template = require('./lib/template');
var storages = require('./lib/storages');
var bundle = require('./lib/bundle');
var realtime = require('./lib/realtime');

var PORT = process.env.PORT || 3000;
var DEBUG = 'DEBUG' in process.env;
var MONGODB_URL = process.env.MONGODB_URL;
var STATIC_DIR = __dirname + '/static';

var Yamlbin = require('./lib/yamlbin');
var app = express();
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
var sampleGames = require('./lib/sample-games')({
  debug: DEBUG
});
var renderHighlightedCode = require('./lib/render-highlighted-code');
var yamlbin;

template.express(app, {
  rootDir: __dirname + '/template',
  debug: DEBUG
});

_.extend(app.locals, {
  GA_TRACKING_ID: process.env.GA_TRACKING_ID,
  GA_HOSTNAME: process.env.GA_HOSTNAME || 'minica.de'
});

// TODO: Add CSRF middleware.
app.use(bodyParser());

if (DEBUG)
  app.get('/js/bundle.js', function(req, res) {
    res.type('application/javascript');
    bundle.generate({debug: true}).pipe(res);
  });

app.get('/css/base.css', renderLess('base.less'));

app.param('realtimeBin', function(req, res, next, param) {
  if (!tagging.isValidTag(param)) return next('route');
  next();
});

app.param('tag', function(req, res, next, param) {
  if (!tagging.isValidTag(param)) return next('route');
  next();
});

app.param('bin', function(req, res, next, param) {
  if (!tagging.isValidTag(param)) return next('route');
  yamlbin.get(param, function(err, yaml, minicade) {
    if (err) return next(err);
    req.minicade = minicade;
    req.yaml = yaml;
    next();
  });
});

app.get('/', function(req, res) {
  res.render('index.html', {
    sampleGames: sampleGames.get()
  });
});

app.get('/games', function(req, res) {
  res.render('games.html', {
    rows: sampleGames.paginate(3)
  });
});

app.get('/docs', function(req, res) {
  res.render('docs.html', {
    highlight_js: renderHighlightedCode('js'),
    highlight_html: renderHighlightedCode('html')
  });
});

app.get('/new-bin', function(req, res, next) {
  yamlbin.findUnique(randomTagGenerator, function(err, bin) {
    if (err) return next(err);
    res.redirect('/b/' + bin);
  });
});

app.get('/f/:realtimeBin', function(req, res, next) {
  res.render('realtime-based-minicade.html', {
    bin: req.params.realtimeBin
  });
});

app.get('/b/:bin', function(req, res, next) {
  res.render('bin-based-minicade.html', {
    bin: req.params.bin,
    isNew: req.minicade.isNew,
    makes: req.minicade.games,
    makesJSON: JSON.stringify(req.minicade.games),
    isPlayable: !!req.minicade.games.length
  });
});

app.get('/b/:bin/edit', function(req, res, next) {
  res.render('bin-based-minicade-edit.html', {
    bin: req.params.bin,
    yaml: req.yaml
  });
});

app.post('/b/:bin/edit', function(req, res, next) {
  var yaml = req.body.yaml;
  if (!yamlcade.isValid(yaml))
    return res.render('bin-based-minicade-edit.html', {
      bin: req.params.bin,
      yaml: yaml,
      hasErrors: true
    });
  yamlbin.update(req.params.bin, yaml, function(err) {
    if (err) return next(err);
    res.redirect('/b/' + req.params.bin);
  });
});

app.get('/new-tag', function(req, res, next) {
  makeapi.findUniqueTag(randomTagGenerator, function(err, tag) {
    if (err) return next(err);
    res.redirect('/t/' + tag);
  });
});

app.get('/t/:tag', function(req, res, next) {
  makeapi.getMakesWithTag(req.params.tag, function(err, makes) {
    if (err) return next(err);
    res.render('tag-based-minicade.html', {
      tag: req.params.tag,
      makes: makes,
      makesJSON: JSON.stringify(makes),
      isPlayable: !!makes.length
    });
  });
});

app.use(express.static(STATIC_DIR));

app.use(function(err, req, res, next) {
  if (typeof(err) == 'number')
    return res.type('text/plain').send(err);
  if (typeof(err.status) == 'number')
    return res.type('text/plain').send(err.status, err.message);
  process.stderr.write(err.stack);
  res.type('text')
    .send(500, DEBUG ? err.stack : 'Sorry, something exploded!');
});

if (!module.parent) (function startServer() {
  var yamlStorage;
  var realtimeStorage;

  function listen() {
    var server = http.createServer(app);
    var wss = new WebSocketServer({server: server});

    yamlbin = Yamlbin({storage: yamlStorage, debug: DEBUG});
    realtime.setStorage(realtimeStorage);
    server.listen(PORT, function() {
      console.log('Listening on port', PORT);
    });

    wss.on('connection', function(ws) {
      var match = ws.upgradeReq.url.match(/\/f\/([A-Za-z0-9\-]+)/);
      if (!match) return ws.close();
      realtime.connection(ws, match[1]);
    });
  }

  if (MONGODB_URL) {
    MongoClient.connect(MONGODB_URL, function(err, db) {
      if (err) throw err;
      yamlStorage = storages.MongoStorage(db, {
        collection: 'yamlbin',
        contentKey: 'yaml'
      });
      realtimeStorage = storages.MongoStorage(db, {
        collection: 'realtime',
        contentKey: 'games'
      });
      listen();
    });
  } else {
    yamlStorage = storages.MemStorage();
    realtimeStorage = storages.MemStorage();
    listen();
  }
})();
