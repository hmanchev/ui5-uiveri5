# UIVeri5 (visualtestjs)

[![Build Status](https://travis-ci.mo.sap.corp/ui5delivery/visualtestjs.svg?token=q7q1Fy6Pv7CUxGsy7QiW&branch=master)](https://travis-ci.mo.sap.corp/ui5delivery/visualtestjs)

## Introduction
UIVeri5 is a visual and application testing framework for UI5-based applications. It uses
[webdriverjs](https://code.google.com/p/selenium/wiki/WebDriverJs) to drive a real browser and interacts with your
application as a real user would. Visualtestjs is heavily inspired and based on [Protractor](http://www.protractortest.org/)
and brings most (and more) of its benefits to UI5 applications.

### Benefits
* Automatic synchronization with UI5 app rendering so there is no need to add waits and sleeps to your test. Tests are reliable by design.
* Tests are written in synchronous manner, no callbacks, no promise chaining so are really simple to write and maintain.
* Full power of webdriverjs, protractor and jasmine - deferred selectors, custom matchers, custom locators.
* Control locators (OPA declarative matchers) allow locating and interacting with UI5 controls.
* Does not depend on testability support in applications - works with autorefreshing views, resizing elements, animated transitions.
* Declarative authentications - authentication flow over OAuth2 providers, etc.
* Open-source (Outbound OSS is in process), console operation (CI ready), fully configurable, no need for java (comming soon) or IDE.
* Covers full ui5 browser matrix - Chrome,Firefox,IE,Edge,Safari,iOS,Android.

#### Upcomming 
* Fix for latest Firefox and Edge support (Q2 2018)
* Cucumber syntax for writing Acceptance Tests, similar tyo Gherkin for OPA (Q2 2018)
* API testing in JS and Cucumber (Q2 2018)
* Code coverage reporting with istambuljs (Q2 2018)
* Visual control selectors recording with UI5 Inspector (Q3 2018) 

### Integration testing
Integration tests are E2E functional tests for applications with actual backends. 
* conf.js
```js
exports.config = {
  profile: 'integration',

  baseUrl: 'https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/master-detail/webapp/test/mockServer.html',
};
```
* masterdetail.spec.js
```js
describe('masterdetail', function () {

  it('should load the app',function() {
    expect(browser.getTitle()).toBe('Master-Detail');

    expect(element.all(by.css('.sapMSplitContainerMaster .sapMLIB')).count()).toBe(21);
  });

  it('should display the details screen',function() {
    element(by.jq('.sapMSplitContainerMaster .sapMLIB:eq(2)')).click();

    expect(element(by.css('.sapMOHTitle')).getText()).toBe('Object 11');
  });

  it('should validate line items',function() {
    expect(element.all(by.css('.sapMSplitContainerDetail tbody tr')).count()).toBe(2);
  });
});
```

### Visual testing
Visual testing is a css regression testing approach based on creating and comparing screenshot of a rendered component.
Reference screenshots could be stored locally or in central git-lfs-like repository.
An except of actual visual test:
```js
describe('sap.m.Wizard', function() {
  it('should load test page', function () {
    expect(takeScreenshot()).toLookAs('initial');
  });
  it('should show the next page', function () {
    element(by.id('branch-wiz-sel')).click();
    expect(takeScreenshot()).toLookAs('branching-initial');
  });
});
```
#### Disclamer
Visual testing in default configuration depends on backend infrastructure for saving the screenshots and tooling and processes for updating the reference images. Currently, this setup is only available and supported for openui5 project itself.
Anyway, if you wish to experiment with visual testing for other projects and you are ready to spend some time to configure it, do not hesitate to reach us for advice.

## Usage

### Integration testing
* Please follow the procedure [install globally](docs/installation.md).
* Create a folder for your integration tests, place them inside and create a conf.js file:
```js
exports.config = {
  profile: 'integration'
};
```
* Run all *.spec.js tests from the folder that contains conf.js. Make sure that root suite is named as spec file name.
```
$ visualtest
```
* Run one specific test
```
$ visualtest --specFilter=mytest.spec.js
```
Please check [applicationtesting.md](docs/usage/applicationtesting.md) for tips on writing integration tests.

### Visual testing

### Run visual tests for OpenUI5
* Please follow the procedure [intall globally](docs/installation.md).
* Run all available tests:
```
$ grunt visualtest
```
* Run only one visual test:
```
$ grunt visualtest --specs=ActionSelect
```
Please check [developing.md](https://github.com/SAP/openui5/blob/master/docs/developing.md) and
[tools.md](https://github.com/SAP/openui5/blob/master/docs/tools.md) for further command-line arguments that
visualtest grunt task accepts. Please check [controllibraries.md](https://github.com/SAP/openui5/blob/master/docs/controllibraries.md)
and [visualtesting.md](docs/usage/visualtesting.md) how to write visual tests.
Please start a new visual test by coping an already existing one. Do not forget to add it to the test suite.

### Usage hints

By default uiveri5 will discover all tests and execute them on local chrome
over automatically started selenium server on localhost:4444.
All of the defaults could be modified either in conf.js or by providing command-line arguments.

* Run tests on different browser
```
--browsers=firefox
```
* Run tests against specific application
```
--baseUrl="http://<host>:<port>"
```
* Run tests against a remove selenium server
```
--seleniumAddress="<host>:<port>/wd/hub"
```
* Run tests on specific Browser/OS combination (if avaiable on the selenium hub).
```
--browsers="ie:9:windows:8"
--browsers="chrome:*:windows"
```
* Enable verbose logging
`-v`
