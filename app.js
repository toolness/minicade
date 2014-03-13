var fs = require('fs');
var express = require('express');
var app = express();

var PORT = process.env.PORT || 3000;
var STATIC_DIR = __dirname + '/static';

app.use(express.static(STATIC_DIR));

app.get('/t/:tag', function(req, res) {
  return fs.createReadStream(STATIC_DIR + '/tag-based-minicade.html')
    .pipe(res);
});

app.listen(PORT, function() {
  console.log('Listening on port', PORT);
});
