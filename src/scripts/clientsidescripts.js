var util = require('util');

// functions to be executed in the browser
var mFunctions = {
  
  loadWaiter: function (mScriptParams) {
    var sDebugLog = 'Loading waitForUI5 implementation, params: ' + 
      'useClassicalWaitForUI5: '  +  mScriptParams.useClassicalWaitForUI5 + 
      ' ,waitForUI5Timeout: ' + mScriptParams.waitForUI5Timeout + 'ms' + 
      ' ,waitForUI5PollingInterval: ' + mScriptParams.waitForUI5PollingInterval + 'ms';
   
    if (!window.sap || !window.sap.ui) {
      return {log: sDebugLog, error: 'No UI5 on this page'};
    }

    if (mScriptParams.useClassicalWaitForUI5) {
      sDebugLog += '\nLoading classical waitForUI5 implementation.';
      loadClassicalWaitForUI5();
    } else {
      try {
        sDebugLog += '\nLoading OPA waitForUI5 implementation.';
        loadOPAWaitForUI5();
      } catch (err) {
        sDebugLog += '\nFailed to load OPA waitForUI5, Fallback to loading classical waitForUI5 implementation. Details: ' + err;
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
          sap.ui.define('sap.ui.autoWaiterAsync',[
            'sap/ui/test/autowaiter/_autoWaiterAsync',
          ], function (_autoWaiterAsync) {
            _autoWaiterAsync.extendConfig({
              timeout: mScriptParams.waitForUI5Timeout,
              interval: mScriptParams.waitForUI5PollingInterval
            });
            return _autoWaiterAsync;
          }, true);
        } catch (err) {
          throw new Error('Cannot define sap.ui.autoWaiterAsync. Details: ' + err);
        }
      }
    }

    return {log: sDebugLog};
  },

  waitForAngular: function (mScriptParams, fnCallback) {
    if (!window.sap || !window.sap.ui) {
      fnCallback('waitForUI5: no UI5 on this page.');
    } else {
      if (sap.ui.autoWaiterAsync) {
        sap.ui.autoWaiterAsync.waitAsync(fnCallback);
      } else if (sap.ui.ClassicalWaitForUI5) {
        sap.ui.ClassicalWaitForUI5.notifyWhenStable(fnCallback);
      } else {
        fnCallback('waitForUI5: no waitForUI5 implementation is currently loaded.');
      }
    }
  },

  getWindowToolbarSize: function () {
    return {
      width: window.outerWidth - window.innerWidth,
      height: window.outerHeight - window.innerHeight
    };
  },

  getControlProperty: function (mScriptParams) {
    if (!window.sap || !window.sap.ui) {
      return {error: 'No UI5 found on the page'};
    }
    try {
      sap.ui.require(['sap/ui/test/_ControlFinder']);
    } catch (err) {
      throw new Error('Your application needs a newer version of UI5 to use control locators! Minimum versions supported: 1.52.12; 1.54.4; 1.55 and up. Details: ' + err);
    }

    var control = sap.ui.test._ControlFinder._getControlForElement(mScriptParams.elementId);
    var property = control ? sap.ui.test._ControlFinder._getControlProperty(control, mScriptParams.property) : null;
    return {property: property};
  },

  findByControl: function (sMatchers, oParentElement) {
    if (!window.sap || !window.sap.ui) {
      throw new Error('findByControl: no UI5 on this page.');
    }

    try {
      sap.ui.require(['sap/ui/test/_ControlFinder']);
    } catch (err) {
      throw new Error('Your application needs a newer version of UI5 to use control locators! Minimum versions supported: 1.52.12; 1.54.4; 1.55 and up. Details: ' + err);
    }

    var mMatchers = JSON.parse(sMatchers);

    if (oParentElement) {
      var control = sap.ui.test._ControlFinder._getControlForElement(oParentElement.id);
      mMatchers.ancestor = control && [[control.getId()]];
    }

    if (mMatchers.id && mMatchers.id.regex) {
      mMatchers.id = new RegExp(mMatchers.id.regex.source, mMatchers.id.regex.flags);
    }
    if (mMatchers.properties) {
      Object.keys(mMatchers.properties).forEach(function (sProperty) {
        var mRegexp = mMatchers.properties[sProperty].regex;
        mMatchers.properties[sProperty] = new RegExp(mRegexp.source, mRegexp.flags);
      });
    }

    return sap.ui.test._ControlFinder._findElements(mMatchers);
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
  'catch(e) { throw (e instanceof Error) ? e : new Error(e); }'
);
for (var fnName in mFunctions) {
  if (mFunctions.hasOwnProperty(fnName)) {
    exports[fnName] = util.format(scriptFmt, mFunctions[fnName]);
    scriptsList.push(util.format('%s: %s', fnName, mFunctions[fnName]));
  }
}

exports.installInBrowser = (util.format(
  'window.clientSideScripts = {%s};', scriptsList.join(', ')));
