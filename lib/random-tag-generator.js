var fs = require('fs');
var util = require('util');
var mustache = require('mustache');
var _ = require('underscore');

function buildWordGenerator(options) {
  var range = _.range(options.numLists);
  var lists = range.map(function(i) {
    return fs.readFileSync(util.format(options.format, i), 'utf-8')
      .trim().split('\n');
  });

  return function() {
    return range.map(function(i) { return _.sample(lists[i]); });
  };
}

module.exports = function(options) {
  var wordOptions = {
    numLists: options.numWordLists,
    format: options.wordListFormat
  };
  var wordGenerator;

  return function generateRandomTag() {
    if (!wordGenerator || options.debug)
      wordGenerator = buildWordGenerator(wordOptions);
    return mustache.render(options.tagTemplate, {
      words: wordGenerator(),
      number: _.random(100, 999).toString()
    });
  };
};
