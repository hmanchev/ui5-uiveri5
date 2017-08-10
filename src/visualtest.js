
var _ = require('lodash');
var proxyquire =  require('proxyquire');
var url = require('url');
var clientsidescripts = require('./scripts/clientsidescripts');
var ClassicalWaitForUI5 = require('./scripts/classicalWaitForUI5');

var DEFAULT_CONNECTION_NAME = 'direct';

/**
 * @typedef Config
 * @type {Object}
 * @property {String} specResolver - spec resolver to use, defaults to: localSpecResolver for profile
 *  integration and localUI5SpecResolver for profile visual
 * @property {String} conf - config file to use, defaults to: '../conf/default.conf.js'
 *  that contains only: profile: 'visual'
 * @property {String} profile - used to resolve profile config file with pattern: '../conf/<profile>.conf.js,
 *  no profile resolved if undefined, defaults to: visual if default.conf.js loaded
 * @property {number} verbose - verbose level, 0 shows only info, 1 shows debug,
 *  2 shows waitForUI5 executions,3 shows also waitForUI5 script content, defaults t: 0
 * @property {<BrowserCapability|String}>[]} browsers - list of browsers to drive. Single word is assumed to
 *  be browserName, supports column delimited and json formats, defaults to: 'chrome'
 * @property {Object} params - params object to be passed to the tests
 * @property {boolean} ignoreSync - disables waitForUI5 synchronization, defaults to: false
 * @property {boolean} useClassicalWaitForUI5 - use classical version of waitForUI5, defaults to: true
 */

/**
 * Runs visual tests
 * @param {Config} config - configs
 */
function run(config) {

  // configure logger
  var logger = require('./logger')(config.verbose);

  // log framework version
  var pjson = require('../package.json');
  logger.info(pjson.name + " v" + pjson.version);

  // log config object so far
  logger.debug('Config from command-line: ${JSON.stringify(config)}',{config:config});

  // merge in config files
  var configParser = require('./configParser')(logger);
  config = configParser.mergeConfigs(config);

  // update logger with resolved configs
  logger.setLevel(config.verbose);

  // log config object so far
  logger.debug('Config after resolving config file and profile: ${JSON.stringify(config)}',{config:config});

  // log cwd
  logger.debug('Current working directory: ' + process.cwd());

  // start module loader
  var moduleLoader = require('./moduleLoader')(config,logger);

  // load spec resolver
  var specResolver = moduleLoader.loadModule('specResolver');

  // resolve specs
  logger.info('Resolving specs');
  specResolver.resolve().then(function(specs){

    if (!specs || specs.length==0){
      throw Error("No specs found");
    }

    // resolve connection
    var connectionName = config.connection || DEFAULT_CONNECTION_NAME;
    var connectionConfig = config.connectionConfigs[connectionName];
    if (!connectionConfig){
      throw Error('Could not find connection: ' + connectionName);
    }

    // create connectionProvider
    var connectionProvider = moduleLoader.loadNamedModule('connection');

    // prepare protractor executor args
    var protractorArgv = connectionProvider.buildProtractorArgv();

    // enable protractor debug logs
    protractorArgv.troubleshoot = config.verbose>0;

    // add baseUrl
    protractorArgv.baseUrl = config.baseUrl;

    // use jasmine 2.0
    protractorArgv.framework = 'jasmine2';
    protractorArgv.jasmineNodeOpts = {};

    // disable default jasmine console reporter
    protractorArgv.jasmineNodeOpts.print = function() {};

    // copy timeouts
    if (config.timeouts){
      if (config.timeouts.getPageTimeout){
        var getPageTimeout = config.timeouts.getPageTimeout;
        if(_.isString(getPageTimeout)){
          getPageTimeout = parseInt(getPageTimeout,10);
        }
        logger.debug('Setting getPageTimeout: ' + getPageTimeout);
        protractorArgv.getPageTimeout = getPageTimeout;
      }
      if (config.timeouts.allScriptsTimeout){
        var allScriptsTimeout = config.timeouts.allScriptsTimeout;
        if(_.isString(allScriptsTimeout)){
          allScriptsTimeout = parseInt(allScriptsTimeout,10);
        }
        logger.debug('Setting allScriptsTimeout: ' + allScriptsTimeout);
        protractorArgv.allScriptsTimeout = allScriptsTimeout;
      }
      if (config.timeouts.defaultTimeoutInterval){
        var defaultTimeoutInterval = config.timeouts.defaultTimeoutInterval;
        if(_.isString(defaultTimeoutInterval)){
          defaultTimeoutInterval = parseInt(defaultTimeoutInterval,10);
        }
        logger.debug('Setting defaultTimeoutInterval: ' + defaultTimeoutInterval);
        protractorArgv.jasmineNodeOpts.defaultTimeoutInterval = defaultTimeoutInterval;
      }
    }

    var ui5SyncDelta = config.timeouts && config.timeouts.waitForUI5Delta;
    var waitForUI5Timeout = ui5SyncDelta > 0 ? (config.timeouts.allScriptsTimeout - ui5SyncDelta) : 0;

    var protractor = proxyquire('protractor/lib/protractor', {
      './clientsidescripts.js': clientsidescripts
    });

    // set specs
    protractorArgv.specs = [];
    specs.forEach(function(spec){
      protractorArgv.specs.push(spec.testPath);
    });

    // resolve runtime and set browsers with capabilities
    var runtimeResolver = require('./runtimeResolver')(config,logger,connectionProvider);
    var runtimes = runtimeResolver.resolveRuntimes();
    protractorArgv.multiCapabilities = runtimeResolver.resolveMultiCapabilitiesFromRuntimes(runtimes);

    // execute runtimes consequently
    // TODO consider concurrent execution
    protractorArgv.maxSessions = 1;

    // export protractor module object as global.protractorModule
    protractorArgv.beforeLaunch = __dirname + '/beforeLaunchHandler';

    /* Consider to restore this if custom connectionProvider could be injected that will work on protractor context
    protractorArgv.beforeLaunch =  function() {

      // override angular-specific scripts
      var protractor = proxyquire('protractor/lib/protractor',
        {'./clientsidescripts.js': clientsidescripts});

      // setup connection provider env
      logger.debug('Setting up connection provider environment');
      return connectionProvider.setupEnv();
    };
    */

    // execute after test env setup and just before test execution starts
    protractorArgv.onPrepare = function () {

      // publish visualtest configs on protractor's browser object
      browser.testrunner = {};
      browser.testrunner.config = config;

      var matchers = {};
      var storageProvider;

      // register a hook to be called when webdriver is created ( may not be connected yet )
      browser.getProcessedConfig().then(function (protractorConfig) {
        var runtime = runtimeResolver.resolveRuntimeFromCapabilities(protractorConfig.capabilities);

        // export current runtime for tests
        browser.testrunner.runtime = runtime;

        // register screenshot provider
        var screenshotProvider = moduleLoader.loadModuleIfAvailable('screenshotProvider', [runtime]);
        if (screenshotProvider) {
          screenshotProvider.register();
        }

        // load storage provider
        storageProvider = moduleLoader.loadModuleIfAvailable('storageProvider', [runtime]);

        // load comparison provider and register the custom matcher
        var comparisonProvider = moduleLoader.loadModuleIfAvailable('comparisonProvider', [storageProvider]);
        if (comparisonProvider) {
          comparisonProvider.register(matchers);
        }

        // process remoteWebDriverOptions
        var isMaximized = _.get(runtime.capabilities.remoteWebDriverOptions, "maximized");
        var remoteWindowPosition = _.get(runtime.capabilities.remoteWebDriverOptions, "position");
        var remoteViewportSize = _.get(runtime.capabilities.remoteWebDriverOptions, "viewportSize");
        var remoteBrowserSize = _.get(runtime.capabilities.remoteWebDriverOptions, "browserSize");

        if (isMaximized) {
          logger.debug('Maximizing browser window');
          browser.driver.manage().window().maximize();
        } else {
          if (remoteWindowPosition) {
            if (_.some(remoteWindowPosition, _.isUndefined)) {
              throw Error('Setting browser window position: X and Y coordinates required but not specified');
            }
            logger.debug('Setting browser window position: x: ' + remoteWindowPosition.x + ', y: ' + remoteWindowPosition.y);
            browser.driver.manage().window().setPosition(remoteWindowPosition.x * 1, remoteWindowPosition.y * 1); // convert to integer implicitly
          }

          if (remoteViewportSize) {
            if (_.some(remoteViewportSize, _.isUndefined)) {
              throw Error('Setting browser viewport size: width and height required but not specified');
            }
            logger.debug('Setting browser viewport size: width: ' + remoteViewportSize.width + ', height: ' + remoteViewportSize.height);
            browser.setViewportSize(remoteViewportSize);
          } else if (remoteBrowserSize) {
            if (_.some(remoteBrowserSize, _.isUndefined)) {
              throw Error('Setting browser window size: width and height required but not specified');
            }
            logger.debug('Setting browser window size: width: ' + remoteBrowserSize.width + ', height: ' + remoteBrowserSize.height);
            browser.driver.manage().window().setSize(remoteBrowserSize.width * 1, remoteBrowserSize.height * 1); // convert to integer implicitly
          }
        }

        // add WebDriver overrides
        if (runtime.capabilities.enableClickWithActions) {
          logger.debug('Activating WebElement.click() override with actions');
          protractorModule.parent.exports.WebElement.prototype.click = function () {
            logger.debug('Taking over WebElement.click()');
            var driverActions = this.driver_.actions().mouseMove(this).click();
            return _moveMouseOutsideBody(driverActions);
          };
        }
      });

      // override with added logging and parameter manipulation
      var origExecuteAsyncScript_= browser.executeAsyncScript_;
      browser.executeAsyncScript_ = function() {
        // log script execution
        logger.trace('Execute async script: ${name}, code:\n ${JSON.stringify(code)}',
          {name:  arguments[1], code: arguments[0]});
        // override the timeout used by waitForAngular
        arguments[2] = JSON.stringify({
          waitForUI5Timeout: waitForUI5Timeout
        });
        //call original function in its context
        return origExecuteAsyncScript_.apply(browser, arguments);
      };

      browser.loadWaitForUI5 = function () {
        return browser.executeScript_(clientsidescripts.loadWaiter, 'browser.loadWaitForUI5', {
            waitForUI5Timeout: waitForUI5Timeout,
            ClassicalWaitForUI5: ClassicalWaitForUI5,
            useClassicalWaitForUI5: config.useClassicalWaitForUI5
          }).then(function (sMessage) {
            logger.debug("loadWaitForUI5: " + sMessage);
          });
      };

      browser.setViewportSize = function (viewportSize) {
        return browser.executeScript_(clientsidescripts.getWindowToolbarSize).then(function (toolbarSize) {
          browser.driver.manage().window().setSize(viewportSize.width * 1 + toolbarSize.width, viewportSize.height * 1 + toolbarSize.height); // convert to integer implicitly
        });
      };

      // add global matchers
      beforeEach(function() {
        jasmine.getEnv().addMatchers(matchers);
      });

      // add additional locators
      moduleLoader.loadModule('locators').forEach(function(locator){
        locator.register(by);
      });

      // hook into specs lifecycle
      // open test content page before every suite
      jasmine.getEnv().addReporter({

        jasmineStarted: function(){
          // call storage provider beforeAll hook
          if (storageProvider && storageProvider.onBeforeAllSpecs){
            storageProvider.onBeforeAllSpecs(specs);
          }
        },

        //TODO consider several describe() per spec file
        suiteStarted: function(result){

          // enclose all WebDriver operations in a new flow so to handle potential failures
          browser.controlFlow().execute(function() {

            var specFullName = result.description;
            var spec = _getSpecByFullName(specFullName);
            if (!spec) {
              fail(new Error('Spec with full name: ' + specFullName + ' not found'));
              return;
            }

            // disable waitForUI5() if explicitly requested
            if (config.ignoreSync) {
              logger.debug('Disabling client synchronization');
              browser.ignoreSynchronization = true;
            }

            // open content page if required
            if (!spec.contentUrl) {
              logger.debug('Skip content page opening');
              return;
            }

            // webdriverjs operations are inherently synchronized by webdriver flow
            // so no need to synchronize manually with callbacks/promises

            // add request params
            if (config.baseUrlQuery && config.baseUrlQuery.length >0){
              var parsedSpecUrl = url.parse(spec.contentUrl);
              if (parsedSpecUrl.search == null) {
                parsedSpecUrl.search = "";
              }
              config.baseUrlQuery.forEach(function(value,index){
                if (index > 0){
                  parsedSpecUrl.search += '&';
                }
                parsedSpecUrl.search += value;
              });
              spec.contentUrl = _.template(url.format(parsedSpecUrl))(browser.testrunner.runtime.ui5);
            }

            // open test page
            browser.testrunner.navigation.to(spec.contentUrl,'auth').then(function () {
              // call storage provider beforeEach hook
              if (storageProvider && storageProvider.onBeforeEachSpec) {
                storageProvider.onBeforeEachSpec(spec);
              }
              if (browser.testrunner.runtime.capabilities.enableClickWithActions) {
                _moveMouseOutsideBody(browser.driver.actions());
              }
            });
          }).then(null,function(error){
            // TODO display only once -> https://github.com/jasmine/jasmine/issues/778
            fail(error);
          });
        },

        suiteDone: function(result){
          var specFullName = result.description;
          var spec = _getSpecByFullName(specFullName);

          // call storage provider afterEach hook
          if (storageProvider && storageProvider.onAfterEachSpec){
            storageProvider.onAfterEachSpec(spec);
          }
        },

        jasmineDone: function(){
          // call storage provider afterAll hook
          if (storageProvider && storageProvider.onAfterAllSpecs){
            storageProvider.onAfterAllSpecs(specs);
          }
        }
      });

      // initialize statistic collector
      var statisticCollector = require('./statisticCollector')();
      jasmine.getEnv().addReporter({
        jasmineStarted: function(){
          statisticCollector.jasmineStarted()
        },
        suiteStarted: function(jasmineSuite){
          statisticCollector.suiteStarted(jasmineSuite);
        },
        specStarted: function(jasmineSpec){
          statisticCollector.specStarted(jasmineSpec);
        },
        specDone: function(jasmineSpec){
          statisticCollector.specDone(jasmineSpec, browser.testrunner.currentSpec._meta);
          delete browser.testrunner.currentSpec._meta;
        },
        suiteDone: function(jasmineSuite){
          statisticCollector.suiteDone(jasmineSuite, browser.testrunner.currentSuite._meta);
          delete browser.testrunner.currentSuite._meta;
        },
        jasmineDone: function(){
          statisticCollector.jasmineDone({runtime:browser.testrunner.runtime});
        }
      });

      // expose navigation helpers to tests
      browser.testrunner.navigation = {
        to: function(url,auth) {
          var authenticator =  moduleLoader.loadNamedModule(auth);

          // open page and login
          browser.controlFlow().execute(function () {
            logger.info('Opening: ' + url);
          });
          authenticator.get(url);

          /*
          // ensure page is fully loaded - wait for window.url to become the same as requested
          var plainContentUrl = url.match(/([^\?\#]+)/)[1];
          browser.driver.wait(function () {
            return browser.driver.executeScript(function () {
              return window.location.href;
            }).then(function (url) {
              // match only host/port/path as app could manipulate request args and fragment
              var urlMathes = url.match(/([^\?\#]+)/);
              return urlMathes !== null && urlMathes[1] === plainContentUrl;
              //return url === spec.contentUrl;
            });
          }, browser.getPageTimeout, 'waiting for page to fully load');
          */

          // handle pageLoading options
          if (config.pageLoading) {

            // reload the page immediately if required
            if (config.pageLoading.initialReload) {
              browser.controlFlow().execute(function () {
                logger.debug('Initial page reload requested');
              });
              browser.driver.navigate().refresh();
            }

            // wait some time after page is loaded
            if (config.pageLoading.wait) {
              var wait = config.pageLoading.wait;
              if (_.isString(wait)) {
                wait = parseInt(wait, 10);
              }

              browser.controlFlow().execute(function () {
                logger.debug('Initial page load wait: ' + wait + 'ms');
              });
              browser.sleep(wait);
            }
          }

          // load waitForUI5 logic on client
          browser.loadWaitForUI5();
          // ensure ui5 is loaded - execute waitForUI5() internally
          return browser.waitForAngular();
        },

        waitForRedirect: function(url){
          // ensure page is fully loaded - wait for window.url to become the same as requested
          var plainContentUrl = url.match(/([^\?\#]+)/)[1];
          return browser.driver.wait(function () {
            return browser.driver.executeScript(function () {
              return window.location.href;
            }).then(function (url) {
              // match only host/port/path as app could manipulate request args and fragment
              var urlMathes = url.match(/([^\?\#]+)/);
              return urlMathes !== null && urlMathes[1] === plainContentUrl;
            });
          }, browser.getPageTimeout, 'Waiting for redirection to complete');
        }
      };

      // set meta data
      browser.testrunner.currentSuite = {
        set meta(value) {
          beforeAll(function(){
            browser.controlFlow().execute(function () {
              browser.testrunner.currentSuite._meta = value;
            });
          });
        },
        get meta() {
         return  {
           set controlName(value){
             browser.testrunner.currentSuite.meta = {controlName: value};
           }
         };
        }
      };
      browser.testrunner.currentSpec = {
        set meta(value) {
          browser.controlFlow().execute(function () {
            browser.testrunner.currentSpec._meta = value;
          });
        },
        get meta() {
          return  browser.testrunner.currentSpec._meta;
        }
      };

      // register reporters
      var jasmineEnv = jasmine.getEnv();
      moduleLoader.loadModule('reporters',[statisticCollector]).forEach(function(reporter){
        reporter.register(jasmineEnv);
      });

      // register flow error handler - seem not necessary to do this manually as jasminewd2 does it well
      /*
      protractor.promise.controlFlow().on('uncaughtException', function(err) {
        console.log('There was an uncaught exception: ' + err);
      });
      */
    };

    protractorArgv.afterLaunch = function(){
      // teardown connection provider env
      logger.debug('Tearing down connection provider environment');
      return connectionProvider.teardownEnv();
    };

    function _getSpecByFullName(specFullName){
      var specIndex = specs.map(function(spec){return spec.fullName;}).indexOf(specFullName);
      if(specIndex==-1){
        return;
      }

      return specs[specIndex];
    }

    /**
     * Moving mouse to body (-1, -1)
     */
    function _moveMouseOutsideBody(driverActions) {
      logger.debug('Moving mouse to body (-1, -1).');
      var bodyElement = element(by.css("body"));
      //var bodyElement = this.driver_.findElement(by.css('body'));
      // replace once we upgrade beyond protractor 2.3.0
      // https://github.com/angular/protractor/issues/2036
      return driverActions.mouseMove(bodyElement, {x:-1, y:-1}).perform();
    }

    // setup connection provider env
    logger.debug('Setting up connection provider environment');
    return connectionProvider.setupEnv().then(function(){
      // call protractor
      logger.info('Executing ' + specs.length + ' specs');
      var protractorLauncher = require('protractor/lib/launcher');
      protractorLauncher.init(null,protractorArgv);
    });
  }).catch(function(error){
    logger.error(error);
    process.exit(1);
  });
};

/**
 * Merge objects and arrays
 */
function _mergeConfig(object,src){
  return _.merge(object,src,function(objectValue,sourceValue){
    if (_.isArray(objectValue)) {
      return objectValue.concat(sourceValue);
    }
  });
};

exports.run = run;
