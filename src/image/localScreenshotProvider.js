
var DEFAULT_TAKE = true;
var webdriver = protractorModule.require('selenium-webdriver');
var pngCrop = require('png-crop');
var _ = require('lodash');

/**
 * @typedef LocalScreenshotProviderConfig
 * @type {Object}
 * @extends {Config}
 * @property {boolean} take - enable screenshot taking
 */

/**
 * @typedef LocalScreenshotProviderInstanceConfig
 * @type {Object}
 */

/**
 * Screenshot provider
 * @constructor
 * @implements {ScreenshotProvider}
 * @param {LocalScreenshotProviderConfig} config
 * @param {LocalScreenshotProviderInstanceConfig} instanceConfig
 * @param {Logger} logger
 * @param {LocalScreenshotProviderInstanceConfig} currentCapabilities
 */
function LocalScreenshotProvider(config,instanceConfig,logger,currentCapabilities) {
  //this.config = config;
  //this.instanceConfig = instanceConfig;
  this.logger = logger;
  this.currentCapabilities = currentCapabilities;

  // set default for take if not provided
  this.take = typeof config.take !== 'undefined' ? config.take : DEFAULT_TAKE;

  this.screenshotSleep = instanceConfig.screenshotSleep;
}

/**
 * Registers takeScreenshot at global variable
 */
LocalScreenshotProvider.prototype.register = function() {
  var that = this;

  global.takeScreenshot = function(element) {
    if (that.take) {
      // take screenshot once UI5 has settled down
      return browser.waitForAngular().then(function(){
        // TODO find and fix all offending CSS animations and then remote this sleep
        // wait a little bit more to work around css animations that could not be disabled easily
        if (that.screenshotSleep){
          browser.sleep(that.screenshotSleep);
        }

        // uses browser object and call webdriverjs function takeScreenshot
        that.logger.debug('Taking actual screenshot');
        return that._takeFullScreenshot().then(function(fullScreenshot) {
          return that._getBrowserScreenshot(fullScreenshot).then(function(browserScreenshot) {
            return that._cropScreenshot(browserScreenshot, element).then(function(screenshot) {
              return screenshot;
            });
          });
        });
      });
    } else {
      that.logger.debug('Screenshot taking disabled so skipping it');
      return '';  // TODO return resolved promise ?
    }
  };
};

/**
 * Take full screenshot (on mobile devices can be device screenshot)
 * @return {string} fullScreenshot, base 64 encoded
 * @private
 */
LocalScreenshotProvider.prototype._takeFullScreenshot = function() {
  var that = this;
  that.logger.debug('Taking full screenshot');

  var remoteOptions = that.currentCapabilities.remoteWebDriverOptions;
  if(remoteOptions && remoteOptions.contextSwitch) {
    var nativeName = 'NATIVE_APP';
    var webviewName = 'WEBVIEW_1';
    if (_.isObject(remoteOptions.contextSwitch)) {
      if(remoteOptions.contextSwitch.native) {
        nativeName = remoteOptions.contextSwitch.native;
      }
      if(remoteOptions.contextSwitch.webView) {
        webviewName = remoteOptions.contextSwitch.webview;
      }
    }

    return browser.switchContext(nativeName).then(function () {
      return browser.takeScreenshot().then(function (fullScreenshot) {
        return browser.switchContext(webviewName).then(function () {
          that.logger.debug('Full screenshot with context switch was taken successfully.');
          return webdriver.promise.fulfilled(fullScreenshot);
        });
      });
    });
  } else {
    return browser.takeScreenshot().then(function (fullScreenshot) {
      that.logger.debug('Full screenshot was taken successfully.');
      return webdriver.promise.fulfilled(fullScreenshot);
    });
  }
};

/**
 * Get browser screenshot. Ex: on mobile emulator/simulator crop the status bar, navigation buttons and etc
 * @param {string} fullScreenshot, base 64 encoded
 * @return {string} browserScreenshot, base 64 encoded
 * @private
 */
LocalScreenshotProvider.prototype._getBrowserScreenshot = function(fullScreenshot) {
  var that = this;
  that.logger.debug('Taking browser screenshot');

  var remoteOptions = that.currentCapabilities.remoteWebDriverOptions;
  if(remoteOptions && remoteOptions.crops) {
    that.logger.debug('Cropping viewport screenshot');
    var screenshotBuffer = new Buffer(fullScreenshot, 'base64');

    var runtimeResolution = that.currentCapabilities.runtime.platformResolution.split('x');
    var cropConfig = {};
    cropConfig.width = runtimeResolution[0];
    cropConfig.height = runtimeResolution[1];
    cropConfig.top = 0;
    cropConfig.left = 0;

    if (remoteOptions.crops.size) {
      if (remoteOptions.crops.size.width) {
        cropConfig.width = remoteOptions.crops.size.width;
      }
      if (remoteOptions.crops.size.height) {
        cropConfig.height = remoteOptions.crops.size.height;
      }
    }
    if (remoteOptions.crops.position) {
      if (remoteOptions.crops.position.x) {
        cropConfig.left = remoteOptions.crops.position.x;
      }
      if (remoteOptions.crops.position.y) {
        cropConfig.top = remoteOptions.crops.position.y;
      }
    }

    return that._crop(screenshotBuffer, cropConfig).then(function (browserScreenshot) {
        return webdriver.promise.fulfilled(browserScreenshot);
    })
  } else {
    return webdriver.promise.fulfilled(fullScreenshot);
  }
};

/**
 * Get single control screenshot if element cropping is requested
 * @param {string} browserScreenshot, base 64 encoded
 * @param {ElementFinder Object} element
 * @return {string} screenshot, base 64 encoded
 * @private
 */
LocalScreenshotProvider.prototype._cropScreenshot = function(browserScreenshot, element) {
  var that = this;

  if(element) {
    var originalImageBuffer = new Buffer(browserScreenshot, 'base64');
    var cropConfig = {};
    // find element dimensions and location
    return element.getSize().then(function (elementSize) {
      cropConfig.width = elementSize.width;
      cropConfig.height = elementSize.height;
      return element.getLocation().then(function (elementLocation) {
        cropConfig.top = elementLocation.y;
        cropConfig.left = elementLocation.x;
        var remoteOptions = that.currentCapabilities.remoteWebDriverOptions;
        if (remoteOptions && remoteOptions.scaling) {
          if (remoteOptions.scaling.x && remoteOptions.scaling.x > 0 && remoteOptions.scaling.x !== 1) {
            cropConfig.width = Math.round(cropConfig.width * remoteOptions.scaling.x);
            cropConfig.left = Math.round(cropConfig.left * remoteOptions.scaling.x);
          }
          if (remoteOptions.scaling.y && remoteOptions.scaling.y > 0 && remoteOptions.scaling.y !== 1) {
            cropConfig.height = Math.round(cropConfig.height * remoteOptions.scaling.y);
            cropConfig.top = Math.round(cropConfig.top * remoteOptions.scaling.y);
          }
        }
        return that._crop(originalImageBuffer, cropConfig).then(function (croppedElement) {
          return webdriver.promise.fulfilled(croppedElement);
        });
      });
    });
  } else {
    return webdriver.promise.fulfilled(browserScreenshot);
  }
};

/**
 * Crop given screenshot by cropping parameters
 * @param {Uint8Array} originalImageBuffer
 * @param {Object} cropConfig, Ex: {width: '', height: '', top: '', left: ''}
 * @return {string} croppedImageBuffer, base 64 encoded
 * @private
 */
LocalScreenshotProvider.prototype._crop = function(originalImageBuffer, cropConfig) {
  var that = this;
  var deferCrop = webdriver.promise.defer();

  that.logger.debug('Cropping the screenshot with parameters: width=' + cropConfig.width +
    ', height=' + cropConfig.height + ', top=' + cropConfig.top + ', left=' + cropConfig.left);
  pngCrop.cropToStream(originalImageBuffer, cropConfig, function (err, outputStream) {
    if (err) {
      deferCrop.reject(new Error('Cannot crop the screenshot: ' + err));
    } else {
      var chunks = [];
      outputStream.on('data', function (chunk) {
        chunks.push(chunk);
      });
      outputStream.on('error', function (error) {
        deferCrop.reject(new Error('Cannot crop the screenshot: ' + error));
      });
      outputStream.on('end', function () {
        var croppedImageBuffer = Buffer.concat(chunks);
        deferCrop.fulfill(croppedImageBuffer.toString('base64'));
      });
    }
  });
  return deferCrop.promise;
};

module.exports = function (config,instanceConfig,logger,currentCapabilities) {
  return new LocalScreenshotProvider(config,instanceConfig,logger,currentCapabilities);
};
