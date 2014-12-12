// TODO: This actually has nothing to do with Firebase, so it should
// be renamed.
//
// TODO: This won't scale across multiple processes, as it assumes
// that it's the only one writing to back-end storage.

var Bacon = require('baconjs').Bacon;

var FakeBackend = require('./fake-backend');

var binStreams = {};
var storage;

function BinStream(bin) {
  this.bin = bin;
  this.stream = new Bacon.Bus();
  this.connections = [];
  this.games = [];

  this.stream.flatMapConcat(function(fn) {
    return Bacon.fromNodeCallback(fn.bind(this));
  }.bind(this)).onError(function(err) {
    // TODO: Actually do something useful with this error.
    console.log("ERROR", err);
  });

  this.stream.push(function fetchGames(cb) {
    storage.get(this.bin, function(err, games) {
      if (err) return cb(err);

      this.games = games || [];
      this.broadcast("setGames", this.games);
      cb(null);
    }.bind(this));
  });
}

BinStream.prototype = {
  send: function(ws, cmd, arg) {
    ws.send(JSON.stringify({cmd: cmd, args: [arg]}));
  },
  broadcast: function(cmd, arg) {
    console.log('broadcasting', cmd, arg);
    this.connections.forEach(function(ws) {
      this.send(ws, cmd, arg);
    }, this);
  },
  addConnection: function(ws) {
    console.log('addConnection', this.bin);
    this.connections.push(ws);
    this.send(ws, "setGames", this.games);
    ws.on('message', function(data) {
      // TODO: Catch exceptions.
      data = JSON.parse(data);
      this.stream.push(function(cb) {
        var backend = new FakeBackend();
        backend.games = this.games;

        // TODO: Sanitize inputs, or this could likely lead to
        // remote code execution.
        // TODO: Catch exceptions.
        var changes = backend[data.cmd].apply(backend, data.args);
        this.games = backend.games;
        this.broadcast("updateGames", changes);
        storage.set(this.bin, this.games, cb);
      });
    }.bind(this));
    ws.on('close', function() {
      this.removeConnection(ws);
    }.bind(this));
  },
  removeConnection: function(ws) {
    console.log('removeConnection', this.bin);
    this.connections.splice(this.connections.indexOf(ws), 1);
    this.stream.push(function maybeCleanup(cb) {
      if (this.connections.length == 0) {
        console.log('cleanup', this.bin);
        this.stream.end();
        delete binStreams[this.bin];
      }
      cb(null);
    });
  }
};

BinStream.get = function(bin) {
  if (!(bin in binStreams))
    binStreams[bin] = new BinStream(bin);
  return binStreams[bin];
};

exports.setStorage = function(newStorage) {
  storage = newStorage;
};

exports.connection = function(ws, bin) {
  BinStream.get(bin).addConnection(ws);
};
