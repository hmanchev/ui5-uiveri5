
var webdriver = require('selenium-webdriver');

/**
 * Handle page authentication
 * @constructor
 * @param {Config} config
 * @param {Object} instanceConfig
 * @param {Logger} logger
 */
function FormAuthenticator(config,instanceConfig,logger,statisticsCollector){
  //this.config = config;
  //this.instanceConfig = instanceConfig;
  this.logger = logger;

  this.user = instanceConfig.user;
  this.pass = instanceConfig.pass;
  this.frameSelector = instanceConfig.frameSelector;
  this.userFieldSelector = instanceConfig.userFieldSelector;
  this.passFieldSelector = instanceConfig.passFieldSelector;
  this.logonButtonSelector = instanceConfig.logonButtonSelector;
  this.statisticsCollector = statisticsCollector;
}

/**
 * Get the page and authenticates with provided credentials
 * @param {string} url - url to get
 * @returns {promise<>} - resolved when the page is full loaded
 */
FormAuthenticator.prototype.get = function(url){

  this.statisticsCollector.specStarted({
    description: 'Authentication'
  });

  var that = this;

  if (!this.user || !this.pass) {
    return webdriver.promise.rejected(
      new Error('Form auth requested but user or pass is not specified'));
  }

  // webdriver statements are synchronized by webdriver flow so no need to join the promises

  // open the page
  browser.driver.get(that.authUrl ? that.authUrl : url);

  // wait till page is fully rendered
  var switchedToFrame = false;
  browser.driver.wait(function(){
    // if auth is in frame => switch inside
    if (that.frameSelector) {
      browser.driver.isElementPresent(by.css(that.frameSelector)).then(function (isInFrame) {
        if (isInFrame && !switchedToFrame) {
          browser.driver.switchTo().frame(browser.driver.findElement(by.css(that.frameSelector))).then(function () {
            switchedToFrame = true;
          });
        }
      });
    }
    return browser.driver.isElementPresent(by.css(that.userFieldSelector));
  },browser.getPageTimeout,'Waiting for auth page to fully load');

  // enter user and pass in the respective fields
  browser.driver.findElement(by.css(this.userFieldSelector)).sendKeys(this.user);
  browser.driver.findElement(by.css(this.passFieldSelector)).sendKeys(this.pass);
  browser.driver.findElement(by.css(this.logonButtonSelector)).click();

  this.statisticsCollector.specDone({
    status: 'passed',
    failedExpectations: [],
    passedExpectations: []
  }, {
    isAuthentication: true
  });

  // ensure redirect is completed
  return browser.testrunner.navigation.waitForRedirect(url);
};

module.exports = function (config,instanceConfig,logger,statisticsCollector) {
  return new FormAuthenticator(config,instanceConfig,logger,statisticsCollector);
};
