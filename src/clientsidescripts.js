var util = require('util');
var waitForUI5 = require('./waitForUI5/waitForUI5.script');

exports.configure = function (oConfig) {
  // functions to be executed in the browser
  var mFunctions = {
    loadWaiter: waitForUI5.loadWaiter,
    waitForAngular: waitForUI5.wait
  };
  exportScriptsAsStrings(mFunctions);
}

/* Publish the functions as strings to pass to WebDriver's
 * exec[Async]Script.  In addition, also include a script that will
 * install all the functions on window (for debugging.)
 *
 * We also wrap any exceptions thrown by a clientSideScripts function
 * that is not an instance of the Error type into an Error type.  If we
 * don't do so, then the resulting stack trace is completely unhelpful
 * and the exception message is just 'unknown error.'  These types of
 * exceptins are the common case for dart2js code.  This wrapping gives
 * us the Dart stack trace and exception message.
 */
function exportScriptsAsStrings(mFunctions) {
  var scriptsList = [];
  var scriptFmt = (
  'try { return (%s).apply(this, arguments); }\n' +
  'catch(e) { throw (e instanceof Error) ? e : new Error(e); }');
  for (var fnName in mFunctions) {
    if (mFunctions.hasOwnProperty(fnName)) {
      exports[fnName] = util.format(scriptFmt, mFunctions[fnName]);
      scriptsList.push(util.format('%s: %s', fnName, mFunctions[fnName]));
    }
  }

  exports.installInBrowser = (util.format(
    'window.clientSideScripts = {%s};', scriptsList.join(', ')));
}
