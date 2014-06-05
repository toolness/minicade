var fs = require('fs');
var should = require('should');

var FLYSWAT = {
  title: 'Flyswat',
  description: 'Swat the fly before time runs out!',
  url: 'http://toolness.github.io/fancy-friday/example/game-01.html'
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
});
