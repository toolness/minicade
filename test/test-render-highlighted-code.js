var should = require('should');

var rhc = require('../lib/render-highlighted-code');

describe('renderHighlightedCode.removeBaseIndent()', function() {
  var removeBaseIndent = rhc.removeBaseIndent;

  it('should work when base indent is nonzero', function() {
    removeBaseIndent('\n' +
      '  hello\n' +
      '    there\n' +
      '  human\n' +
      '  '
    ).should.eql(
      'hello\n' +
      '  there\n' +
      'human'
    );
  });

  it('should do nothing to empty strings', function() {
    removeBaseIndent('').should.eql('');
  });

  it('should work when base indent is zero', function() {
    removeBaseIndent('\n' +
      'hello\n' +
      '  there\n' +
      'human\n' +
      ''
    ).should.eql(
      'hello\n' +
      '  there\n' +
      'human'
    );
  });
});

describe('renderHighlightedCode()', function() {
  it('should work with html', function() {
    var highlighter = rhc('html')();
    highlighter('\n<p>\n')
      .should.eql("<pre class=\"hljs\"><span class=\"hljs-tag\">&lt;<span class=\"hljs-title\">p</span>&gt;</span></pre>");
  });
  it('should work with js', function() {
    var highlighter = rhc('js')();
    highlighter('\nx = 1;\n')
      .should.eql("<pre class=\"hljs\">x = <span class=\"hljs-number\">1</span>;</pre>");
  });
});
