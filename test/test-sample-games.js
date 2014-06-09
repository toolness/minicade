var should = require('should');

var SampleGames = require('../lib/sample-games');

describe('SampleGames::get()', function() {
  it('should load at least one sample game', function() {
    SampleGames().get().length.should.be.above(0);
  });

  it('should set remix info on games', function() {
    SampleGames().get().forEach(function(game) {
      game.remixurl.should.be.a.String;
      game.remixtool.should.be.a.String;
    });
  });

  it('should set author info on games', function() {
    SampleGames().get().forEach(function(game) {
      game.authors.should.be.an.Array;
    });
  });
});
