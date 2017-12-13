var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

var DEFAULT_SCREENSHOTS_ROOT = 'target/report/screenshots/';

function JasmineScreenshotReporter (config, instanceConfig, logger, collector) {
  this.config = config;
  this.instanceConfig = instanceConfig;
  this.logger = logger;
  this.collector = collector;
  this.screenshotsRoot = instanceConfig.screenshotsRoot || DEFAULT_SCREENSHOTS_ROOT;
  this.failedExpectationIndex = 0;
}

JasmineScreenshotReporter.prototype.jasmineStarted = function() {
  mkdirp.sync(this.screenshotsRoot);
  this.logger.debug('Report screenshots root folder: ' + this.screenshotsRoot + ' is successfully created.');
};

JasmineScreenshotReporter.prototype.suiteStarted = function () {
};

JasmineScreenshotReporter.prototype.specStarted = function () {
  this.failedExpectationIndex = 0;
};

JasmineScreenshotReporter.prototype.specDone = function (spec) {
};

JasmineScreenshotReporter.prototype.suiteDone = function () {
};

JasmineScreenshotReporter.prototype.jasmineDone = function () {
};

// should be called after browser.getProcessedConfig()
JasmineScreenshotReporter.prototype._registerOnExpectationFailure = function () {
  var that = this;
  var originalAddExpectationResult = jasmine.Spec.prototype.addExpectationResult;
  
  jasmine.Spec.prototype.addExpectationResult = function (expectationPassed) {
    var specFullName = this.result.fullName;

    if (!expectationPassed) {
      browser.takeScreenshot().then(function (png) {
        that.failedExpectationIndex += 1;
        var specName = (specFullName + '-' + that.failedExpectationIndex).substring(0, 230);
        var fileTimestamp = new Date().toISOString().substring(0, 19);
        var fileName = (specName + '-' + fileTimestamp + '.png').replace(/[\/\?<>\\:\*\|":\s]/g, '-');
        fs.writeFileSync(path.join(that.screenshotsRoot, fileName), new Buffer(png, 'base64'));
        that.logger.debug('Screenshot created for failed expectation "' + fileName + '"');
      }, function (err) {
        that.logger.error('Error while taking report screenshot for test "' + specFullName + '": ' + err.message);
      });
    }

    return originalAddExpectationResult.apply(this, arguments);
  };
};

JasmineScreenshotReporter.prototype.register = function (jasmineEnv) {
  jasmineEnv.addReporter(this);
  if (_.get(this.config, 'takeScreenshot.onExpectFailure')) {
    this._registerOnExpectationFailure();
  }
};

module.exports = function (config, instanceConfig, logger, collector) {
  return new JasmineScreenshotReporter(config, instanceConfig, logger, collector);
};
