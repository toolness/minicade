var should = require('should');

var Yamlbin = require('../lib/yamlbin');

describe('yamlbin', function() {
  it('should find unique bins', function(done) {
    var i = 0;
    var generator = function() {
      if (++i < 50) return 'foo';
      return 'bar';
    };
    var storage = new Yamlbin.MemStorage();
    var bin = new Yamlbin({storage: storage});
    bin.findUnique(generator, function(err, name) {
      if (err) return done(err);
      name.should.eql('foo');
      i.should.equal(1);
      storage.cache.foo = 'blah';
      bin.findUnique(generator, function(err, name) {
        if (err) return done(err);
        name.should.eql('bar');
        i.should.equal(50);
        done();
      });
    });
  });
});
