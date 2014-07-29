var fs = require('fs');
var should = require('should');

var FLYSWAT = {
  title: 'Flyswat',
  description: 'Swat the fly before time runs out!',
  url: 'http://toolness.github.io/fancy-friday/example/game-01.html',
  contenturl: 'http://toolness.github.io/fancy-friday/example/game-01.html'
};

var yamlcade = require('../lib/yamlcade');

function getYaml(filename) {
  return fs.readFileSync(__dirname + '/yaml/' + filename, 'utf8');
}

describe('yamlcade', function() {
  it('should parse full YAML minicades', function() {
    yamlcade.parse(getYaml('sample-minicade.yaml')).should.eql({
      title: 'My Example Yamlcade',
      games: [FLYSWAT]
    });
  });

  it('should parse list-only YAML', function() {
    yamlcade.parse(getYaml('list-only.yaml')).should.eql({
      games: [FLYSWAT]
    });
  });

  it('should report invalid YAML', function() {
    yamlcade.isValid('wat').should.be.false;
  });

  it('should report valid YAML', function() {
    yamlcade.isValid(getYaml('list-only.yaml')).should.be.true;
  });

  it('should report invalid URLs', function() {
    (function() {
      yamlcade.parse('- url: wat');
    }).should.throw('invalid format for property: url');
  });

  it('should set default game title', function() {
    yamlcade.parse('- url: http://foo.org/')
      .games[0].title.should.eql('Untitled Game');
  });

  it('should remove irrelevant properties', function() {
    ('blah' in yamlcade.parse('- url: http://f.in/\n  blah: hmm').games[0])
      .should.be.false;
  });

  it('should handle *.makes.org games specially', function() {
    var minicade = yamlcade.parse('- url: https://a.makes.org/foo');
    minicade.games[0].contenturl.should.eql('https://a.makes.org/foo_');
    minicade.games[0].remixurl.should.eql('https://a.makes.org/foo/remix');
  });

  it('should handle jsbin.com games specially', function() {
    var minicade = yamlcade.parse('- url: http://jsbin.com/foo');
    minicade.games[0].remixurl.should.eql('http://jsbin.com/foo/edit');

    minicade = yamlcade.parse('- url: http://jsbin.com/foo/');
    minicade.games[0].remixurl.should.eql('http://jsbin.com/foo/edit');
  });

  it('should handle github.com remixurls specially', function() {
    var minicade = yamlcade.parse('- url: http://boop.me/\n' +
                                  '  remixurl: https://github.com/boop/me');
    minicade.games[0].remixtool.should.eql('GitHub');
  });
});
