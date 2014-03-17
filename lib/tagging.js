var TAG_RE = /^([A-Za-z0-9_\-]+)$/;

exports.isValidTag = function(tag) {
  return TAG_RE.test(tag);
};
