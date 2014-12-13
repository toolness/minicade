var should = require('should');

var Ops = require('../lib/realtime/ops');

describe('Realtime Ops', function() {
  it('should start with no games', function() {
    var backend = new Ops();
    backend.games.should.eql([]);
  });

  it('should add games', function() {
    var backend = new Ops(function() { return "guid"; });

    backend.addGame({
      title: "boop",
      description: "sup",
      url: "http://example.org/",
      extra: "this should be removed"
    });
    backend.games.should.eql([{
      id: "guid",
      title: "boop",
      description: "sup",
      url: "http://example.org/"      
    }]);
  });

  it('should update games', function() {
    var backend = new Ops(function() { return "guid"; });

    backend.addGame({
      title: "boop",
      description: "sup",
      url: "http://example.org/"
    });
    backend.changeGame("guid", {title: "woot"});
    backend.games.should.eql([{
      id: "guid",
      title: "woot",
      description: "sup",
      url: "http://example.org/"      
    }]);
  });

  it('should remove games', function() {
    var backend = new Ops(function() { return "guid"; });

    backend.addGame({
      title: "boop",
      description: "sup",
      url: "http://example.org/"
    });
    backend.removeGame("boop");
    backend.games.should.eql([]);    
  });
});
