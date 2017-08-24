var util = require('util');

// functions to be executed in the browser
var mFunctions = {
  loadWaiter: function (mScriptParams) {
    var sDebugLog = "";

    if (mScriptParams.useClassicalWaitForUI5) {
      sDebugLog += "Loading classical waitForUI5 implementation.";
      loadClassicalWaitForUI5();
    } else {
      try {
        sDebugLog += "Loading OPA waitForUI5 implementation.";
        loadOPAWaitForUI5();
      } catch (e) {
        sDebugLog += "Failed to load OPA waitForUI5. Fallback to classical implementation.";
        loadClassicalWaitForUI5();
      }
    }

    function loadClassicalWaitForUI5() {
      if (!sap.ui.ClassicalWaitForUI5) {
        var ClassicalWaitForUI5 = new Function('return (' + mScriptParams.ClassicalWaitForUI5 + ').apply(this, arguments)');
        sap.ui.getCore().registerPlugin({
          startPlugin: function (oCore) {
            jQuery.sap.declare('sap.ui.ClassicalWaitForUI5');
            sap.ui.ClassicalWaitForUI5 = new ClassicalWaitForUI5(mScriptParams.waitForUI5Timeout, {
              getUIDirty: oCore.getUIDirty.bind(oCore),
              attachUIUpdated: oCore.attachUIUpdated.bind(oCore)
            });
          }
        });
      }
    }

    function loadOPAWaitForUI5() {
      if (!sap.ui.autoWaiterAsync) {
        try {
          jQuery.sap.declare('sap.ui.autoWaiterAsync');
          sap.ui.define([
            'sap/ui/test/autowaiter/_autoWaiterAsync'
          ], function (_autoWaiterAsync) {
            _autoWaiterAsync.extendConfig({
              timeout: mScriptParams.waitForUI5Timeout / 1000,
              timeoutWaiter: {
                maxDelay: mScriptParams.waitForUI5Timeout
              }
            });
            return _autoWaiterAsync;
          }, true);
        } catch (e) {
          throw new Error('Cannot define sap.ui.autoWaiterAsync. ' +
            'Module sap/ui/test/autowaiter/_autoWaiterAsync is not available. Details: ' + e);
        }
      }
    }

    return sDebugLog;
  },
  waitForAngular: function (mScriptParams, fnCallback) {
    if (sap.ui.autoWaiterAsync) {
      sap.ui.autoWaiterAsync.waitAsync(fnCallback);
    } else if (sap.ui.ClassicalWaitForUI5) {
      sap.ui.ClassicalWaitForUI5.notifyWhenStable(fnCallback);
    } else {
      fnCallback("waitForAngular: failed to wait for UI5 updates - no waitForUI5 implementation is currently loaded.");
    }
  },
  getWindowToolbarSize: function () {
    return {
      width: window.outerWidth - window.innerWidth,
      height: window.outerHeight - window.innerHeight
    };
  }
};

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
