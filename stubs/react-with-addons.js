// We're stubbing this out in browserify so browserify doesn't take a ridiculous
// amount of time to generate the bundle.

if (!window.React)
  throw new Error("window.React is not defined!");

module.exports = window.React;
