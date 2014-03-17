var fs = require('fs');
var util = require('util');
var mustache = require('mustache');
var _ = require('underscore');

function buildWordGenerator(options) {
  var lists = [];
  var iter;

  for (var i = 0; i < options.numLists; i++)
    lists.push(fs.readFileSync(util.format(options.format, i), 'utf-8')
      .trim().split('\n'));

  return function() {
    var list = [];
    for (var i = 0; i < options.numLists; i++) list.push(_.sample(lists[i]));
    return list;
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
      number: _.random(1, 999).toString()
    });
  };
};
