var EventEmitter = require('events').EventEmitter;
var _ = require('underscore');
var should = require('should');

var storages = require('../lib/storages');
var realtime = require('../lib/realtime');

function noop() {
}

function withoutGuids(games) {
  return games.map(function(game) {
    return _.omit(game, 'id');
  });
}

function FakeWs() {
  var self = new EventEmitter();

  self.send = function(data) {
    self.emit('_send', data);
  };

  return self;
}

describe('realtime', function() {
  var storage;

  beforeEach(function() {
    storage = storages.MemStorage();
    realtime.setStorage(storage);
  });

  it('should work', function(done) {
    var ws = FakeWs();
    var client = realtime.Client(function sendMessage(data) {
      //console.log("SEND", data);
      ws.emit('message', JSON.stringify(data));
    }, noop);
    ws.on('_send', function(data) {
      //console.log("RECEIVE", data);
      client.receiveMessage(JSON.parse(data));
    });
    var binStream = realtime.connection(ws, 'lol');
    binStream.connections.length.should.eql(1);
    binStream.stream.onEnd(function() {
      //console.log("END STREAM");
      binStream.connections.length.should.eql(0);
      withoutGuids(client.games).should.eql([{
        title: 'sup',
        description: 'yo',
        url: 'http://example.org/'
      }]);
      done();
    });
    client.addGame({
      title: 'sup',
      description: 'yo',
      url: 'http://example.org/'
    });
    process.nextTick(function() {
      ws.emit('close');
    });
  });
});
