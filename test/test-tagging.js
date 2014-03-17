var should = require('should');

var tagging = require('../lib/tagging');

describe('tagging.isValidTag()', function() {
  var isValidTag = tagging.isValidTag;

  it('should accept valid tags', function() {
    isValidTag('alphaBets').should.be.true;
    isValidTag('with-hyphens').should.be.true;
    isValidTag('with_underscores').should.be.true;
    isValidTag('alphanum3r1cs').should.be.true;
  });

  it('should reject invalid tags', function() {
    isValidTag('no_punctuation!').should.be.false;
  });
});
