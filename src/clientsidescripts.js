/**
* @typedef PendingTimeout
* @type {Object}
* @property {number} id
* @property {string} errStack - caller fn stack
*/

/**
 * @typedef PendingXhr
 * @type {Object}
 * @property {number} id
 * @property {string} errStack - caller fn stack
 */

/**
 * @typedef FunctionInfo
 * @type {Object}
 * @property {number} delay - requested timeout delay
 * @property {number} callCount - how many times same timeout was requested
 * @property {number} callTime - time when called fn first requested such timeout
 * @property {string} errStack - caller fn stack
 */

/**
 * @typedef TimeoutInfo
 * @type {Object.<function: caller fn, FunctionInfo>}
 */

var functions = {};

functions.waitForAngular = function(config, callback) {
  var MAX_RETRY_ATTEMPTS = 10;

  try {
    if (!window.sap) {
      callback('SAPUI5 could not be found on the window');
    }

    var fnDefineTestCooperation = function() {

      jQuery.sap.declare('sap.ui.core.TestCooperation');

      sap.ui.define(['jquery.sap.global', 'sap/ui/base/Metadata'],
        function(jQuery, Metadata) {
          'use strict';

          var TestCooperation = Metadata.createClass('sap.ui.core.TestCooperation', {

            constructor : function(oCore) {

              this._bSameTick = false;
              /** @type {PendingTimeout[]} */
              this.aPendingTimeouts = [];
              /** @type {PendingXhr[]} */
              this.aPendingXhrs = [];
              this.iXhrSeq = 0;
              /** @type {TimeoutInfo} */
              this.oTimeoutInfo = {};
              this.fnPendingCallback = null;
              this.oCore = oCore;
              this.fnOriginalSetTimeout = null;
              this.fnOriginalClearTimeout = null;
              this.fnOriginalXhrSend = null;
              this.iGuardingTimeoutId = null;

              this._wrapSetTimeout();
              this._wrapClearTimeout();
              this._wrapXHR();

              this.debug = /sap-ui-testcooperation-debug=true/.test(window.location.search);

              var configJson = JSON.parse(config);
              this.waitForUI5Timeout = configJson.waitForUI5Timeout || 0;
            }
          });

          // Constants for TestCooperation class
          TestCooperation.EXECUTE_CALLBACKS_REG_EXP = /_scheduleCallbackExecution/;
          TestCooperation.MAX_TIMEOUT_DELAY = 5000;
          TestCooperation.MAX_INTERVAL_STEP = 2000;
          TestCooperation.TIMEOUT_CALL_COUNT_THRESHOLD = 5;

          /**
           * Mark the callback as pending if something is still in progress.
           * Execute the callback immediately if:
           * - no pending timeouts
           * - no pending XHRs
           * - no pending callback
           */
          TestCooperation.prototype.notifyWhenStable = function(fnCallback) {
            var that = this;
            if (this.aPendingTimeouts.length === 0 && this.aPendingXhrs.length === 0 && !this.oCore.getUIDirty()
              && !this.fnPendingCallback) {
              fnCallback();
            } else {
              that.fnPendingCallback = fnCallback;

              if (that.waitForUI5Timeout > 0) {
                that.iGuardingTimeoutId = that.fnOriginalSetTimeout.call(window, function() {
                  var msg = 'Timeout waiting to synchronize with UI5 after ' + that.waitForUI5Timeout + ' ms.\n'
                    + that._getPendingCallbacksInfo('Pending timeouts: ' + that.aPendingTimeouts.length, that.aPendingTimeouts)
                    + that._getPendingCallbacksInfo('\nPending XHRs: ' + that.aPendingXhrs.length, that.aPendingXhrs);

                  that._logDebugMessage(msg);
                  that.fnPendingCallback(msg);
                  that.fnPendingCallback = null;
                  that.iGuardingTimeoutId = null;
                }, that.waitForUI5Timeout);
              }
            }
          };

          /**
           * Handle new timeout.
           * @see _handleTimeoutFinished
           * @see _handleTimeoutScheduled
           * @see _resolveCurrentStackTrace
           * @return {number} timeout id
           */
          TestCooperation.prototype._wrapSetTimeout = function() {
            var that = this;
            that.fnOriginalSetTimeout = window.setTimeout;
            window.setTimeout = function(func, delay) {
              var id;
              function wrapper() {
                func.apply();
                that._handleTimeoutFinished(id);
              }
              id = that.fnOriginalSetTimeout.call(window, wrapper, delay);
              that._handleTimeoutScheduled(id, func, delay, that._resolveCurrentStackTrace());
              return id;
            };
          };

          /**
           * If timeout is canceled handle it like finished.
           * @see _handleTimeoutFinished
           */
          TestCooperation.prototype._wrapClearTimeout = function() {
            var that = this;
            that.fnOriginalClearTimeout = window.clearTimeout;
            window.clearTimeout = function(id) {
              that.fnOriginalClearTimeout.call(window, id);
              that._handleTimeoutFinished(id);
            };
          };

          /**
           * Manage XHR requests.
           * @see _resolveCurrentStackTrace
           * @see _logDebugMessage
           * @see _removeItemFromTracking
           * @see _tryToExecuteCallback
           */
          TestCooperation.prototype._wrapXHR = function() {
            var that = this;
            that.fnOriginalXhrSend = window.XMLHttpRequest.prototype.send;
            window.XMLHttpRequest.prototype.send = function() {
              var errStack = that._resolveCurrentStackTrace();
              var xhrId = that.iXhrSeq++;
              this.addEventListener('readystatechange', function() {
                if (this.readyState == 4) {
                  var isXhrDeleted = that._removeItemFromTracking(xhrId, that.aPendingXhrs);
                  if (isXhrDeleted) {
                    that._logDebugMessage('XHR finished. ID: ' + xhrId + ' Pending XHRs: ' + that.aPendingXhrs.length);
                    that._tryToExecuteCallback();
                  }
                }
              });
              that.aPendingXhrs.push({'id': xhrId, 'errStack': errStack});
              that._logDebugMessage('XHR started. Pending XHRs: ' + that.aPendingXhrs.length);
              that.fnOriginalXhrSend.apply(this, arguments);
            };
          };

          /**
           * When new timeout is scheduled and if it's tracked: add it to the pending timeouts.
           * @param {number} id
           * @param {function} func
           * @param {number} delay
           * @param {string} errStack
           * @see _isTimeoutTrackable
           * @see _logDebugMessage
           */
          TestCooperation.prototype._handleTimeoutScheduled = function(id, func, delay, errStack) {
            delay = typeof delay == 'number' ? delay : 0;

            if (this._isTimeoutTrackable(id, func, delay, errStack)) {
              this.aPendingTimeouts.push({'id': id, 'errStack': errStack});
              this._logDebugMessage('Timeout scheduled. Timer ID: ' + id + ' Delay: ' + delay + '. Pending timeouts: '
                + this.aPendingTimeouts.length);
            }
          };

          /**
           * When timeout is finished and if it's tracked: delete it.
           * @param {number} id
           * @see _removeItemFromTracking
           * @see _logDebugMessage
           * @see _tryToExecuteCallback
           */
          TestCooperation.prototype._handleTimeoutFinished = function(id) {
            var isTimeoutDeleted = this._removeItemFromTracking(id, this.aPendingTimeouts);
            if (isTimeoutDeleted) {
              this._logDebugMessage('Timeout with ID ' + id + ' finished. Pending timeouts: '
                + this.aPendingTimeouts.length);
              this._tryToExecuteCallback();
            }
          };

          /**
           * Check if the timeout should be tracked.
           * Don't track the timeout, if:
           * - it's come from the _tryToExecuteCallback with no delay
           * - the delay is bigger than the MAX_TIMEOUT_DELAY
           * - the call count is bigger that the TIMEOUT_CALL_COUNT_THRESHOLD
           * Track the timeout if isn't already tracked and the interval isn't exceeded the MAX_INTERVAL_STEP
           * @param {number} id
           * @param {function} func
           * @param {number} delay
           * @param {string} errStack
           * @see _getFunctionName
           * @see _removeItemFromTracking
           * @see _logDebugMessage
           * @return {boolean} if the timeout is tracked
           */
          TestCooperation.prototype._isTimeoutTrackable = function(id, func, delay, errStack) {
            if ((delay === 0 && TestCooperation.EXECUTE_CALLBACKS_REG_EXP.test(this._getFunctionName(func)))  // the pending timeout from _tryToExecuteCallback should not be tracked
              || delay > TestCooperation.MAX_TIMEOUT_DELAY) { // do not track request longer than 5 sec
              this._removeItemFromTracking(id, this.aPendingTimeouts);
              this._logDebugMessage('Timeout skipped from tracking. Timer ID: ' + id + ' Delay: ' + delay + ' Details: '
                + errStack);
              return false;
            } else {
              var isNewTimeout = !this.oTimeoutInfo.hasOwnProperty(func) // first timeout request by this function
                || this.oTimeoutInfo[func].delay != delay // same function request timeout with other duration
                || Date.now() - this.oTimeoutInfo[func].callTime > TestCooperation.MAX_INTERVAL_STEP; // overall call time took more than 2000
              if (isNewTimeout) {
                this.oTimeoutInfo[func] = {'delay': delay, 'callCount': 1, 'callTime': Date.now(), 'errStack': errStack};
                return true;
              } else {
                if (++this.oTimeoutInfo[func].callCount <= TestCooperation.TIMEOUT_CALL_COUNT_THRESHOLD) {
                  return true;
                } else {
                  this._removeItemFromTracking(id, this.aPendingTimeouts);
                  this._logDebugMessage('Timeout skipped from tracking because exceed it the maximum call count. '
                    + 'Timer ID: ' + id + ' Delay: ' + delay + ' Details: ' + errStack);
                  return false;
                }
              }
            }
          };

          /**
           * Execute pending callback if it's in different ticks.
           * The tick should be different because the timeout can be canceled.
           */
          TestCooperation.prototype._tryToExecuteCallback = function() {
            if (!this._bSameTick) {
              var that = this;
              this._bSameTick = true;
              window.setTimeout(function _scheduleCallbackExecution() {
                if (that.aPendingTimeouts.length === 0 && that.aPendingXhrs.length === 0 && !that.oCore.getUIDirty()
                  && that.fnPendingCallback) {
                  that.fnPendingCallback();
                  that.fnPendingCallback = null;
                  if (that.waitForUI5Timeout > 0) {
                    that.fnOriginalClearTimeout.call(window, that.iGuardingTimeoutId);
                    that.iGuardingTimeoutId = null;
                  }
                }
                that._bSameTick = false;
              }, 0);
            }
          };

          /**
           * Log debug messages when debug mode is on.
           * @param {string} message
           */
          TestCooperation.prototype._logDebugMessage = function(message) {
            if (this.debug === true) {
              console.debug(message);
            }
          };

          /**
           * Return message with all pending callbacks info.
           * @param {string} message
           * @param {Object[]} pendingExecutions
           * @return {string} message
           */
          TestCooperation.prototype._getPendingCallbacksInfo = function(message, pendingExecutions) {
            if (pendingExecutions && pendingExecutions.length > 0) {
              message += '. Pending callbacks:';
              pendingExecutions.forEach(function (pendingExecution) {
                message += '\n\tID ' + pendingExecution.id + ':' + pendingExecution.errStack;
              });
            }

            return message;
          };

          /**
           * Get function name.
           * @param {function} func
           * @return {string} function name
           */
          TestCooperation.prototype._getFunctionName = function(func) {
            var functionName;
            if (func.name && typeof func.name == 'string') {
              functionName = func.name;
            } else {
              functionName = func.toString();
              functionName = functionName.substring('function'.length, functionName.indexOf('('));
            }
            return functionName.trim();
          };

          /**
           * Get timeout by timer id.
           * @param {Object[]} searchArray
           * @param {number} searchForId
           * @return {Object{}} the matched timeout in an array
           */
          TestCooperation.prototype._getPendingExecutionById = function(searchArray, searchForId) {
            return searchArray.filter(function(item) {
              return item.id === searchForId;
            });
          };

          /**
           * Remove timeout from pending timeout list.
           * @param {number} id
           * @param {Object[]} aTrackedList
           * @return {boolean} if item is deleted
           */
          TestCooperation.prototype._removeItemFromTracking = function(id, aTrackedList) {
            var isItemDeleted = false;
            var currentItemArr = this._getPendingExecutionById(aTrackedList, id);
            if (currentItemArr.length > 0) {
              aTrackedList.splice(aTrackedList.indexOf(currentItemArr[0]), 1);
              isItemDeleted = true;
            }
            return isItemDeleted;
          };

          /**
           * Get stacktrace. Error().stack doesn't work for IE!
           * For IE the stack property is set to undefined when the error is constructed, and gets the trace information
           * when the error is raised.
           * @return {string} stack trace
           */
          TestCooperation.prototype._resolveCurrentStackTrace = function() {
            try {
              throw new Error();
            } catch (err) {
              return err.stack;
            }
          };

          return TestCooperation;

        }, /* bExport= */ true);
    };

    var tryToNotifyCallback = function(attempts) {
      if (sap.ui.TestCooperation) {
        try {
          sap.ui.TestCooperation.notifyWhenStable(callback);
        } catch (e) {
          callback('Unable to notify callback.\nError: ' + e.message);
        }
      } else if (sap.ui.core.TestCooperation) {
        try {
          sap.ui.getCore().registerPlugin({
            startPlugin: function(oCore) {
              sap.ui.TestCooperation = new sap.ui.core.TestCooperation({
                getUIDirty: oCore.getUIDirty.bind(oCore),
                attachUIUpdated: oCore.attachUIUpdated.bind(oCore)
              });
            }
          });
        } catch (e) {
          callback('Unable to instantiate TestCooperation.\nError: ' + e.message);
        }

        if(attempts < 1) {
          if (!sap.ui) {
            callback('SAPUI5 is not present');
          } else {
            callback('retries for notify callback exceeded');
          }
        } else {
          window.setTimeout(function() {tryToNotifyCallback(attempts - 1);}, 1000);
        }
      } else {
        try {
          if (sap.ui) {
            fnDefineTestCooperation();
          } else {
            window.setTimeout(function() {tryToNotifyCallback(attempts - 1);}, 1000);
          }
        } catch (e) {
          callback('Unable to inject TestCooperation.\nError: ' + e.message);
        }

        if(attempts < 1) {
          if (!sap.ui) {
            callback('SAPUI5 is not present');
          } else {
            callback('retries for notify callback exceeded');
          }
        } else {
          window.setTimeout(function() {tryToNotifyCallback(attempts - 1);}, 1000);
        }
      }
    };
    tryToNotifyCallback(MAX_RETRY_ATTEMPTS);
  } catch (err) {
    callback(err.message);
  }
};

/* Publish all the functions as strings to pass to WebDriver's
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
var util = require('util');
var scriptsList = [];
var scriptFmt = (
'try { return (%s).apply(this, arguments); }\n' +
'catch(e) { throw (e instanceof Error) ? e : new Error(e); }');
for (var fnName in functions) {
  if (functions.hasOwnProperty(fnName)) {
    exports[fnName] = util.format(scriptFmt, functions[fnName]);
    scriptsList.push(util.format('%s: %s', fnName, functions[fnName]));
  }
}

exports.installInBrowser = (util.format(
  'window.clientSideScripts = {%s};', scriptsList.join(', ')));
