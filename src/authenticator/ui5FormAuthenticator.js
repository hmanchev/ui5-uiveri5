
var webdriver = require('selenium-webdriver');

/**
 * Handle page authentication
 * @constructor
 * @param {Config} config
 * @param {Object} instanceConfig
 * @param {Logger} logger
 */
function UI5FormAuthenticator(config,instanceConfig,logger,statisticCollector){
  //this.config = config;
  //this.instanceConfig = instanceConfig;
  this.logger = logger;

  this.user = instanceConfig.user;
  this.pass = instanceConfig.pass;
  this.userFieldSelector = instanceConfig.userFieldSelector;
  this.passFieldSelector = instanceConfig.passFieldSelector;
  this.logonButtonSelector = instanceConfig.logonButtonSelector;
  this.statisticCollector = statisticCollector;
}

/**
 * Get the page and authenticates with provided credentials
 * @param {string} url - url to get
 * @returns {promise<>} - resolved when the page is full loaded
 */
UI5FormAuthenticator.prototype.get = function(url){

  this.statisticsCollector.specStarted({
    description: 'Authentication'
  });

  if (!this.user || !this.pass) {
    return webdriver.promise.rejected(
      new Error('UI5 Form auth requested but user or pass is not specified'));
  }

  // open the page
  browser.driver.get(url);

  // synchronize with UI5 on credentials page
  browser.loadWaitForUI5();
  browser.waitForAngular();

  // enter user and pass in the respective fields
  element(by.css(this.userFieldSelector)).sendKeys(this.user);
  element(by.css(this.passFieldSelector)).sendKeys(this.pass);
  element(by.css(this.logonButtonSelector)).click();

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

module.exports = function(config,logger,statisticCollector){
  return new UI5FormAuthenticator(config,logger,statisticCollector);
};
