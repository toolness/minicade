// TODO: This won't scale across multiple processes, as it assumes
// that it's the only one writing to back-end storage.

var Bacon = require('baconjs').Bacon;

var starterMinicade = require('./starter-minicade.json');
var Ops = require('./ops');
var Client = require('./client');

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

      this.games = games || starterMinicade;
      this.broadcast("setGames", [this.games]);
      cb(null);
    }.bind(this));
  });
}

BinStream.prototype = {
  send: function(ws, cmd, args) {
    ws.send(JSON.stringify({cmd: cmd, args: args}));
  },
  broadcast: function(cmd, args) {
    //console.log('broadcasting', cmd, arg);
    this.connections.forEach(function(ws) {
      this.send(ws, cmd, args);
    }, this);
  },
  addConnection: function(ws) {
    //console.log('addConnection', this.bin);
    this.connections.push(ws);
    this.send(ws, "setGames", [this.games]);
    ws.on('message', this._onMessage.bind(this));
    ws.on('close', function() {
      this.removeConnection(ws);
    }.bind(this));
    return this;
  },
  _onMessage: function(data) {
    try {
      data = JSON.parse(data);
    } catch (e) {
      return;
    }
    this.stream.push(this._processMessage.bind(this, data));
  },
  _processMessage: function(data, cb) {
    var ops = new Ops();
    ops.games = this.games;

    try {
      // TODO: Sanitize inputs better.
      if (!/^[A-Za-z]+$/.test(data.cmd))
        throw new Error("illegal command: " + data.cmd);

      if (typeof(ops[data.cmd]) != 'function')
        throw new Error("no such command: " + data.cmd);

      var changes = ops[data.cmd].apply(ops, data.args);
    } catch (e) {
      return cb(e);
    }
    if (changes) {
      this.games = ops.games;
      this.broadcast(data.cmd, data.args);
      storage.set(this.bin, this.games, cb);
    } else {
      cb(null);
    }
  },
  removeConnection: function(ws) {
    //console.log('removeConnection', this.bin);
    this.connections.splice(this.connections.indexOf(ws), 1);
    this.stream.push(function maybeCleanup(cb) {
      if (this.connections.length == 0) {
        //console.log('cleanup', this.bin);
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

exports.setStarterMinicade = function(newStarterMinicade) {
  starterMinicade = newStarterMinicade;
};

exports.connection = function(ws, bin) {
  return BinStream.get(bin).addConnection(ws);
};

exports.Client = Client;
