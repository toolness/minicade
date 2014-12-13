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

function Connection(bin) {
  var ws = FakeWs();
  var client = realtime.Client(function sendMessage(data) {
    //console.log("SEND", data);
    ws.emit('message', JSON.stringify(data));
  }, noop);
  ws.on('_send', function(data) {
    //console.log("RECEIVE", data);
    client.receiveMessage(JSON.parse(data));
  });
  var binStream = realtime.connection(ws, bin);

  return {
    binStream: binStream,
    client: client,
    end: function(cb) {
      process.nextTick(function() {
        ws.emit('close');
        if (cb) cb();
      });
    }
  };
}

describe('realtime', function() {
  var storage;

  beforeEach(function() {
    storage = storages.MemStorage();
    realtime.setStorage(storage);
  });

  it('should close binStream when no more clients exist', function(done) {
    var conn1 = Connection('hmm');
    var conn2 = Connection('hmm');
    var binStream = conn1.binStream;

    conn1.binStream.should.equal(conn2.binStream);
    binStream.stream.onEnd(function() {
      binStream.connections.length.should.eql(0);
      done();
    });
    binStream.connections.length.should.eql(2);
    conn1.end(function() {
      binStream.connections.length.should.eql(1);
      conn2.end();
    });
  });

  it('should update storage', function(done) {
    var conn = Connection('kik');
    conn.binStream.stream.onEnd(function() {
      storage.get('kik', function(err, games) {
        if (err) return done(err);
        withoutGuids(games).should.eql([{
          title: 'hi',
          description: 'yo',
          url: 'http://example.org/'
        }]);
        done();
      });
    });
    conn.client.addGame({
      title: 'hi',
      description: 'yo',
      url: 'http://example.org/'
    });
    conn.end();
  });

  it('should send updates when adding games', function(done) {
    var conn = Connection('lol');
    conn.binStream.stream.onEnd(function() {
      withoutGuids(conn.client.games).should.eql([{
        title: 'sup',
        description: 'yo',
        url: 'http://example.org/'
      }]);
      done();
    });
    conn.client.addGame({
      title: 'sup',
      description: 'yo',
      url: 'http://example.org/'
    });
    conn.end();
  });

  it('should send updates when changing games', function(done) {
    storage.set('blop', [{
      id: 'deadbeef1',
      title: 'sup',
      description: 'yo',
      url: 'http://example.org/'
    }], function(err) {
      if (err) return done(err);
      var conn = Connection('blop');
      conn.client.changeGame('deadbeef1', {
        description: 'yo redux'
      });
      conn.binStream.stream.onEnd(function() {
        conn.client.games.should.eql([{
          id: 'deadbeef1',
          title: 'sup',
          description: 'yo redux',
          url: 'http://example.org/'
        }]);
        done();
      });
      conn.end();
    });
  });

  it('should send updates when removing games', function(done) {
    storage.set('blop', [{
      id: 'deadbeef1',
      title: 'sup',
      description: 'yo',
      url: 'http://example.org/1'
    }, {
      id: 'deadbeef2',
      title: 'hi',
      description: 'bleh',
      url: 'http://example.org/2'
    }], function(err) {
      if (err) return done(err);
      var conn = Connection('blop');
      conn.client.removeGame('deadbeef1');
      conn.binStream.stream.onEnd(function() {
        conn.client.games.should.eql([{
          id: 'deadbeef2',
          title: 'hi',
          description: 'bleh',
          url: 'http://example.org/2'
        }]);
        done();
      });
      conn.end();
    });
  });
});
