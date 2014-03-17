var nock = require('nock');
var should = require('should');

var makeapi = require('../lib/makeapi');

var fakeMakes = require('./sample-makes').fancyFridayDemos;

describe('makeapi.doesTagExist()', function() {
  var mockedMake;

  beforeEach(function() {
    mockedMake = nock('https://makeapi.webmaker.org')
      .get('/api/20130724/make/search?tags=exists&limit=1');
  });

  afterEach(function() { mockedMake.done(); });

  it('should return true when makes w/ tag exist', function(done) {
    mockedMake = mockedMake.reply(200, {makes: [fakeMakes]});
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

describe('makeapi.findUniqueTag()', function() {
  it('should retry until a unique tag is found', function(done) {
    var i = 0;
    var mockedMake = nock('https://makeapi.webmaker.org')
      .get('/api/20130724/make/search?tags=lol0&limit=1')
      .reply(200, {makes: [fakeMakes]})
      .get('/api/20130724/make/search?tags=lol1&limit=1')
      .reply(200, {makes: []});

    function candidateGenerator() { return 'lol' + i++; }

    makeapi.findUniqueTag(candidateGenerator, function(err, tag) {
      if (err) return done(err);
      tag.should.eql('lol1');
      mockedMake.done();
      done();
    });
  });
});
