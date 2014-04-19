var should = require('should');
var nock = require('nock');

var GistCache = require('../lib/gist-cache');

describe('GistCache', function() {
  it('should return null for nonexistent gists', function(done) {
    var gists = new GistCache();
    var github = nock('https://api.github.com')
      .get('/gists/12345')
      .reply(404);
    gists.get(12345, function(err, gist) {
      if (err) return done(err);
      should.equal(gist, null);
      done();
    });
  });

  it('should return error for odd response codes', function(done) {
    var gists = new GistCache();
    var github = nock('https://api.github.com')
      .get('/gists/12345')
      .reply(500);
    gists.get(12345, function(err, gist) {
      err.message.should.eql('got http status 500');
      done();
    });
  });

  it('should return cached entries when possible', function(done) {
    var gists = new GistCache();
    var github = nock('https://api.github.com')
      .get('/gists/12345')
      .reply(200, {data: 'awesome'}, {'ETag': '"here is an etag"'})
      .get('/gists/12345')
      .matchHeader('if-none-match', '"here is an etag"')
      .reply(304)
      .get('/gists/12345')
      .matchHeader('if-none-match', '"here is an etag"')
      .reply(304);

    gists.get(12345, function(err, gist) {
      if (err) return done(err);

      gist.should.eql({data: 'awesome'});
      gists.get(12345, function(err, gist) {
        if (err) return done(err);
        gist.should.eql({data: 'awesome'});

        gists.get(12345, function(err, gist) {
          if (err) return done(err);
          gist.should.eql({data: 'awesome'});

          github.done();
          done();
        });
      });
    });
  });

  it('should return status', function(done) {
    var gists = new GistCache();
    var github = nock('https://api.github.com')
      .get('/rate_limit')
      .reply(200, {some: 'info'});

    gists.status(function(err, info) {
      if (err) return done(err);
      info.should.eql({
        cache: {
          itemCount: 0,
          length: 0
        },
        rateLimit: {
          some: 'info'
        }
      });

      github.done();
      done();
    });
  });
});
