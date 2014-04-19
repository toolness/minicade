var nunjucks = require('nunjucks');
var _ = require('underscore');

function nullMapArgs() { return {}; }

function noTransform(body, context, args) { return body; }

function TransformExtension(options) {
  if (!(this instanceof TransformExtension))
    return new TransformExtension(options);
  var self = this;
  var tag = options.tag;
  var transform = options.transform || noTransform;
  var mapArgs = options.mapArgs || nullMapArgs;

  self.options = options;
  self.tags = [tag];

  // http://jlongster.github.io/nunjucks/api.html#custom-tags
  self.parse = function(parser, nodes, lexer) {
    var token = parser.nextToken();

    var args = parser.parseSignature(null, true);
    parser.advanceAfterBlockEnd(token.value);

    var body = parser.parseUntilBlocks('end' + tag);
    parser.advanceAfterBlockEnd();

    return new nodes.CallExtension(self, 'run', args, [body]);
  };

  self.run = function(context, args, body) {
    var originalCtx = context.ctx;
    context.ctx = _.extend({}, context.ctx, mapArgs(args));
    var result = transform.call(options, body(), context.ctx, args);
    context.ctx = originalCtx;
    return result;
  };

  self.initialize = function(env) {
    env.addExtension(tag, self);
  };

  return self;
}

module.exports = TransformExtension;
