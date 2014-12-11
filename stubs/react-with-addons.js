// We're stubbing this out in browserify so browserify doesn't take a ridiculous
// amount of time to generate the bundle.

if (!window.React)
  throw new Error("window.React is not defined!");

var expectedVersion = require('../package.json').dependencies.react;

if (window.React.version != expectedVersion)
  throw new Error("React version mismatch! Expected " + expectedVersion +
                  " but found " + window.React.version + ".");

module.exports = window.React;
