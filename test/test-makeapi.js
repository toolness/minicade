var nock = require('nock');
var should = require('should');

var makeapi = require('../lib/makeapi');

describe('makeapi.doesTagExist()', function() {
  var mockedMake;

  beforeEach(function() {
    mockedMake = nock('https://makeapi.webmaker.org')
      .get('/api/20130724/make/search?tags=exists&limit=1');
  });

  afterEach(function() { mockedMake.done(); });

  it('should return true when makes w/ tag exist', function(done) {
    mockedMake = mockedMake.reply(200, {makes: [{this_is: 'a fake make'}]});
    makeapi.doesTagExist('exists', function(err, exists) {
      if (err) return done(err);
      exists.should.be.true;
      done();
    });
  });

  it('should return false when makes w/ tag do not exist', function(done) {
    mockedMake = mockedMake.reply(200, {makes: []});
    makeapi.doesTagExist('exists', function(err, exists) {
      if (err) return done(err);
      exists.should.be.false;
      done();
    });
  });

  it('should return an err when status is not 200', function(done) {
    mockedMake = mockedMake.reply(404);
    makeapi.doesTagExist('exists', function(err, exists) {
      err.message.should.eql('got status code 404');
      done();
    });
  });
});
