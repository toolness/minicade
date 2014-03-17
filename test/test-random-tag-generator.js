var should = require('should');
var randomTagGenerator = require('../lib/random-tag-generator');

describe('random-tag-generator', function() {
  it('should work', function() {
    var gen = randomTagGenerator({
      numWordLists: 2,
      wordListFormat: __dirname + '/../static/word-lists/word-%d.txt',
      tagTemplate: '{{words.0}}_{{words.1}}_LOL_{{number}}'
    });
    for (var i = 0; i < 100; i++)
      gen().should.match(/^\w+_\w+_LOL_\d+$/);
  });
});
