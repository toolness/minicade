var EventEmitter = require('events').EventEmitter;
var should = require('should');

var storages = require('../lib/storages');
var realtime = require('../lib/realtime');

function FakeWs() {
  var self = new EventEmitter();

  self._sent = [];
  self.send = function(data) {
    self._sent.push(JSON.parse(data));
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
    var binStream = realtime.connection(ws, 'lol');
    binStream.connections.length.should.eql(1);
    binStream.stream.onEnd(function() {
      binStream.connections.length.should.eql(0);
      ws._sent.should.eql([{
        cmd: 'setGames',
        args: [[]]
      }]);
      done();
    });
    ws.emit('close');
  });
});
