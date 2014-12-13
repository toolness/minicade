var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var browserify = require('browserify');

exports.generate = function(options) {
  var b = browserify(_.extend({
    basedir: __dirname + '/..'
  }, options || {}))
    .require('./stubs/react-with-addons.js', {expose: 'react/addons'})
    .require('underscore')
    .require('./lib/realtime/client')
    .require('./lib/minicade-schema');

  return b.bundle();
};

exports.generateFile = function() {
  var relpath = 'static/js/bundle.js';
  var filename = path.normalize(__dirname + '/../' + relpath);
  console.log('Generating ' + relpath + '...');
  exports.generate()
    .pipe(fs.createWriteStream(filename))
    .on('close', function() {
      console.log('Done.');
    });
};

if (!module.parent)
  exports.generateFile();
